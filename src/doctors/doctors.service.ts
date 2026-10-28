import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { Doctor } from './entities/doctor.entity';
import { DoctorPublicProfile } from '../common/interfaces/doctor-public.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DOCTOR_ERROR_MESSAGES } from './constants/doctor-messages.constants';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorsRepository: Repository<Doctor>,
  ) {}
  findAll() {
    return `This action returns all doctors`;
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
