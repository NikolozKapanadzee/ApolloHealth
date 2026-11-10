import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Between, MoreThan, Not, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import {
  APPOINTMENT_ERROR_MESSAGES,
  APPOINTMENT_SUCCESS_MESSAGES,
} from './constants/appointment-messages.constants';
import { AuthUser } from '../common/interfaces/auth.interface';
import { UserRole } from '../common/enums/UserRole.enum';
import { AppointmentStatus } from '../common/enums/AppointmentStatus.enum';
import { AppointmentPublic } from '../common/interfaces/appointment-public.interface';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';
import { COMMON_MESSAGES } from '../common/constants/common.constants';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Doctor)
    private readonly doctorsRepository: Repository<Doctor>,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    currentUser: AuthUser,
  ) {
    const patientId = this.resolvePatientId(createAppointmentDto, currentUser);
    await this.assertPatient(patientId);

    const doctor = await this.doctorsRepository.findOne({
      where: { id: createAppointmentDto.doctorId },
    });
    if (!doctor) {
      throw new NotFoundException(
        APPOINTMENT_ERROR_MESSAGES.APPOINTMENT.DOCTOR_NOT_FOUND,
      );
    }

    const scheduledAt = new Date(createAppointmentDto.scheduledAt);
    if (scheduledAt.getTime() <= Date.now()) {
      throw new BadRequestException(
        APPOINTMENT_ERROR_MESSAGES.APPOINTMENT.SCHEDULED_IN_PAST,
      );
    }

    await this.assertSlotAvailable(createAppointmentDto.doctorId, scheduledAt);

    const appointment = this.appointmentsRepository.create({
      patientId,
      doctorId: createAppointmentDto.doctorId,
      scheduledAt,
      notes: createAppointmentDto.notes ?? null,
      status: AppointmentStatus.SCHEDULED,
    });
    await this.appointmentsRepository.save(appointment);

    const saved = await this.findAppointmentOrThrow(appointment.id);

    return {
      message: APPOINTMENT_SUCCESS_MESSAGES.APPOINTMENT.CREATED,
      data: this.toPublic(saved),
    };
  }

  async findAll(query: FindAppointmentsQueryDto, currentUser: AuthUser) {
    if (currentUser.role === UserRole.DOCTOR) {
      const doctor = await this.doctorsRepository.findOne({
        where: { userId: currentUser.id },
        select: { id: true },
      });
      if (!doctor) {
        return {
          data: [],
          meta: {
            page: query.page,
            limit: query.limit,
            total: 0,
            totalPages: 0,
          },
        };
      }
    }

    const where = await this.buildListWhere(query, currentUser);

    const [appointments, total] =
      await this.appointmentsRepository.findAndCount({
        where,
        relations: { patient: true, doctor: { user: true } },
        order: { scheduledAt: 'ASC' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });

    return {
      data: appointments.map((appointment) => this.toPublic(appointment)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: number, currentUser: AuthUser) {
    const appointment = await this.findAppointmentOrThrow(id);
    this.assertCanView(appointment, currentUser);
    return this.toPublic(appointment);
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
    currentUser: AuthUser,
  ) {
    const appointment = await this.findAppointmentOrThrow(id);
    this.assertCanUpdate(appointment, updateAppointmentDto, currentUser);

    if (updateAppointmentDto.scheduledAt !== undefined) {
      const scheduledAt = new Date(updateAppointmentDto.scheduledAt);
      if (scheduledAt.getTime() <= Date.now()) {
        throw new BadRequestException(
          APPOINTMENT_ERROR_MESSAGES.APPOINTMENT.SCHEDULED_IN_PAST,
        );
      }
      await this.assertSlotAvailable(
        appointment.doctorId,
        scheduledAt,
        appointment.id,
      );
      appointment.scheduledAt = scheduledAt;
    }

    if (updateAppointmentDto.status !== undefined) {
      appointment.status = updateAppointmentDto.status;
    }

    if (updateAppointmentDto.notes !== undefined) {
      appointment.notes = updateAppointmentDto.notes;
    }

    await this.appointmentsRepository.save(appointment);
    const saved = await this.findAppointmentOrThrow(id);

    return {
      message: APPOINTMENT_SUCCESS_MESSAGES.APPOINTMENT.UPDATED,
      data: this.toPublic(saved),
    };
  }

  async cancel(id: number, currentUser: AuthUser) {
    const appointment = await this.findAppointmentOrThrow(id);
    this.assertCanCancel(appointment, currentUser);

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException(
        APPOINTMENT_ERROR_MESSAGES.APPOINTMENT.NOT_SCHEDULED,
      );
    }

    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentsRepository.save(appointment);

    return {
      message: APPOINTMENT_SUCCESS_MESSAGES.APPOINTMENT.CANCELLED,
      data: this.toPublic(appointment),
    };
  }

  private resolvePatientId(
    { patientId }: CreateAppointmentDto,
    currentUser: AuthUser,
  ): number {
    if (currentUser.role === UserRole.PATIENT) {
      if (patientId !== undefined && patientId !== currentUser.id) {
        throw new ForbiddenException(
          COMMON_MESSAGES.PERMISSION.PERMISSION_DENIED,
        );
      }
      return currentUser.id;
    }

    if (patientId === undefined) {
      throw new BadRequestException(
        APPOINTMENT_ERROR_MESSAGES.APPOINTMENT.PATIENT_ID_REQUIRED,
      );
    }

    return patientId;
  }

  private async assertPatient(patientId: number) {
    const patient = await this.usersRepository.findOne({
      where: { id: patientId },
      select: { id: true, userRole: true },
    });
    if (!patient) {
      throw new NotFoundException(
        APPOINTMENT_ERROR_MESSAGES.APPOINTMENT.PATIENT_NOT_FOUND,
      );
    }
    if (patient.userRole !== UserRole.PATIENT) {
      throw new BadRequestException(
        APPOINTMENT_ERROR_MESSAGES.APPOINTMENT.INVALID_PATIENT_ROLE,
      );
    }
  }

  private async assertSlotAvailable(
    doctorId: number,
    scheduledAt: Date,
    excludeAppointmentId?: number,
  ) {
    const taken = await this.appointmentsRepository.exists({
      where: {
        doctorId,
        scheduledAt,
        status: AppointmentStatus.SCHEDULED,
        ...(excludeAppointmentId !== undefined && {
          id: Not(excludeAppointmentId),
        }),
      },
    });
    if (taken) {
      throw new ConflictException(
        APPOINTMENT_ERROR_MESSAGES.APPOINTMENT.SLOT_TAKEN,
      );
    }
  }

  private async buildListWhere(
    query: FindAppointmentsQueryDto,
    currentUser: AuthUser,
  ) {
    const base: Record<string, unknown> = {};

    if (query.status) {
      base.status = query.status;
    }

    if (query.from && query.to) {
      base.scheduledAt = Between(new Date(query.from), new Date(query.to));
    } else if (query.from) {
      base.scheduledAt = MoreThan(new Date(query.from));
    }

    if (currentUser.role === UserRole.PATIENT) {
      return { ...base, patientId: currentUser.id };
    }

    if (currentUser.role === UserRole.DOCTOR) {
      const doctor = await this.doctorsRepository.findOne({
        where: { userId: currentUser.id },
        select: { id: true },
      });
      return { ...base, doctorId: doctor!.id };
    }

    if (query.patientId) {
      base.patientId = query.patientId;
    }
    if (query.doctorId) {
      base.doctorId = query.doctorId;
    }

    return base;
  }

  private async findAppointmentOrThrow(id: number) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: { patient: true, doctor: { user: true } },
    });
    if (!appointment) {
      throw new NotFoundException(
        APPOINTMENT_ERROR_MESSAGES.APPOINTMENT.NOT_FOUND,
      );
    }
    return appointment;
  }

  private assertCanView(appointment: Appointment, currentUser: AuthUser) {
    if (this.isStaff(currentUser.role)) {
      return;
    }
    if (
      currentUser.role === UserRole.PATIENT &&
      appointment.patientId === currentUser.id
    ) {
      return;
    }
    if (
      currentUser.role === UserRole.DOCTOR &&
      appointment.doctor.userId === currentUser.id
    ) {
      return;
    }
    throw new ForbiddenException(COMMON_MESSAGES.PERMISSION.PERMISSION_DENIED);
  }

  private assertCanUpdate(
    appointment: Appointment,
    dto: UpdateAppointmentDto,
    currentUser: AuthUser,
  ) {
    this.assertCanView(appointment, currentUser);

    const changingScheduleOrStatus =
      dto.scheduledAt !== undefined || dto.status !== undefined;

    if (
      changingScheduleOrStatus &&
      appointment.status !== AppointmentStatus.SCHEDULED
    ) {
      throw new BadRequestException(
        APPOINTMENT_ERROR_MESSAGES.APPOINTMENT.NOT_SCHEDULED,
      );
    }

    const changingSchedule = dto.scheduledAt !== undefined;
    const changingStatus = dto.status !== undefined;
    const changingNotes = dto.notes !== undefined;

    if (currentUser.role === UserRole.PATIENT) {
      if (changingSchedule || changingNotes) {
        throw new ForbiddenException(
          COMMON_MESSAGES.PERMISSION.PERMISSION_DENIED,
        );
      }
      if (changingStatus && dto.status !== AppointmentStatus.CANCELLED) {
        throw new ForbiddenException(
          COMMON_MESSAGES.PERMISSION.PERMISSION_DENIED,
        );
      }
      if (appointment.patientId !== currentUser.id) {
        throw new ForbiddenException(
          COMMON_MESSAGES.PERMISSION.PERMISSION_DENIED,
        );
      }
      return;
    }

    if (currentUser.role === UserRole.DOCTOR) {
      if (changingSchedule) {
        throw new ForbiddenException(
          COMMON_MESSAGES.PERMISSION.PERMISSION_DENIED,
        );
      }
      if (changingNotes) {
        return;
      }
      if (changingStatus && dto.status !== AppointmentStatus.COMPLETED) {
        throw new ForbiddenException(
          COMMON_MESSAGES.PERMISSION.PERMISSION_DENIED,
        );
      }
      if (appointment.doctor.userId !== currentUser.id) {
        throw new ForbiddenException(
          COMMON_MESSAGES.PERMISSION.PERMISSION_DENIED,
        );
      }
      return;
    }

    if (this.isStaff(currentUser.role)) {
      return;
    }

    throw new ForbiddenException(COMMON_MESSAGES.PERMISSION.PERMISSION_DENIED);
  }

  private assertCanCancel(appointment: Appointment, currentUser: AuthUser) {
    if (this.isStaff(currentUser.role)) {
      return;
    }
    if (
      currentUser.role === UserRole.PATIENT &&
      appointment.patientId === currentUser.id
    ) {
      return;
    }
    throw new ForbiddenException(COMMON_MESSAGES.PERMISSION.PERMISSION_DENIED);
  }

  private isStaff(role: UserRole) {
    return role === UserRole.DIRECTOR || role === UserRole.RECEPTIONIST;
  }

  private toPublic(appointment: Appointment): AppointmentPublic {
    return {
      id: appointment.id,
      patientId: appointment.patientId,
      patientFirstName: appointment.patient.firstName,
      patientLastName: appointment.patient.lastName,
      doctorId: appointment.doctorId,
      doctorFirstName: appointment.doctor.user.firstName,
      doctorLastName: appointment.doctor.user.lastName,
      doctorSpecialty: appointment.doctor.specialty,
      scheduledAt: appointment.scheduledAt,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }
}
