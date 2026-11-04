import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { Doctor } from './entities/doctor.entity';
import { DoctorPublicProfile } from '../common/interfaces/doctor-public.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { DOCTOR_ERROR_MESSAGES } from './constants/doctor-messages.constants';
import { FindDoctorsQueryDto } from './dto/find-doctors-query.dto';

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
    const doctor = await this.doctorsRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!doctor) {
      throw new NotFoundException(DOCTOR_ERROR_MESSAGES.DOCTOR.NOT_FOUND);
    }
    return this.toPublicProfile(doctor);
  }

  update(id: number, updateDoctorProfileDto: UpdateDoctorProfileDto) {
    return `This action updates a #${id} doctor`;
  }

  remove(id: number) {
    return `This action removes a #${id} doctor`;
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
