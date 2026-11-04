import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { Doctor } from './entities/doctor.entity';
import { DoctorPublicProfile } from '../common/interfaces/doctor-public.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import {
  DOCTOR_ERROR_MESSAGES,
  DOCTOR_SUCCESS_MESSAGES,
} from './constants/doctor-messages.constants';
import { FindDoctorsQueryDto } from './dto/find-doctors-query.dto';
import { AuthUser } from '../common/interfaces/auth.interface';
import { UserRole } from '../common/enums/UserRole.enum';
import { COMMON_MESSAGES } from '../common/constants/common.constants';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorsRepository: Repository<Doctor>,
  ) {}
  async findAll({ page, limit, specialty }: FindDoctorsQueryDto) {
    const [doctors, total] = await this.doctorsRepository.findAndCount({
      where: specialty ? { specialty: ILike(`%${specialty}%`) } : {},
      relations: { user: true },
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: doctors.map((doctor) => this.toPublicProfile(doctor)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const doctor = await this.findDoctorOrThrow(id);
    return this.toPublicProfile(doctor);
  }

  async update(
    id: number,
    updateDoctorProfileDto: UpdateDoctorProfileDto,
    currentUser: AuthUser,
  ) {
    const doctor = await this.findDoctorOrThrow(id);
    this.assertCanUpdate(doctor, currentUser);

    if (updateDoctorProfileDto.licenseNumber !== undefined) {
      updateDoctorProfileDto.licenseNumber =
        updateDoctorProfileDto.licenseNumber.trim().toUpperCase();
      await this.assertLicenseAvailable(
        updateDoctorProfileDto.licenseNumber,
        doctor.id,
      );
    }

    Object.assign(doctor, updateDoctorProfileDto);
    await this.doctorsRepository.save(doctor);

    return {
      message: DOCTOR_SUCCESS_MESSAGES.DOCTOR.UPDATED,
      data: this.toPublicProfile(doctor),
    };
  }

  async remove(id: number) {
    const doctor = await this.findDoctorOrThrow(id);
    const data = this.toPublicProfile(doctor);
    await this.doctorsRepository.remove(doctor);

    return {
      message: DOCTOR_SUCCESS_MESSAGES.DOCTOR.DELETED,
      data,
    };
  }

  private async findDoctorOrThrow(id: number) {
    const doctor = await this.doctorsRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!doctor) {
      throw new NotFoundException(DOCTOR_ERROR_MESSAGES.DOCTOR.NOT_FOUND);
    }
    return doctor;
  }

  private assertCanUpdate(doctor: Doctor, currentUser: AuthUser) {
    const isDirector = currentUser.role === UserRole.DIRECTOR;
    const isOwnProfile =
      currentUser.role === UserRole.DOCTOR && doctor.userId === currentUser.id;

    if (!isDirector && !isOwnProfile) {
      throw new ForbiddenException(
        COMMON_MESSAGES.PERMISSION.PERMISSION_DENIED,
      );
    }
  }

  private async assertLicenseAvailable(
    licenseNumber: string,
    doctorId: number,
  ) {
    const taken = await this.doctorsRepository.exists({
      where: { licenseNumber, id: Not(doctorId) },
    });
    if (taken) {
      throw new ConflictException(DOCTOR_ERROR_MESSAGES.DOCTOR.LICENSE_IN_USE);
    }
  }

  private toPublicProfile(doctor: Doctor): DoctorPublicProfile {
    return {
      id: doctor.id,
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      specialty: doctor.specialty,
      bio: doctor.bio,
      yearsOfExperience: doctor.yearsOfExperience,
      imageUrl: doctor.imageUrl,
    };
  }
}
