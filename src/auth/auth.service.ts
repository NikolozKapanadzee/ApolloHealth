import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
} from './constants/auth-messages';
import * as bcrypt from 'bcrypt';
import { USER_ERROR_MESSAGES } from '../users/constants/user-messages';
import { UserRole } from '../common/enums/UserRole.enum';
import { CreateStaffDto } from './dtos/create-staff.dto';
import { Doctor } from '../doctors/entities/doctor.entity';
import { DOCTOR_ERROR_MESSAGES } from '../doctors/constants/doctor-messages.constants';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async register(registerDto: RegisterDto) {
    const data = await this.createUser(registerDto);
    return {
      message: AUTH_SUCCESS_MESSAGES.AUTH.REGISTERED,
      data: data,
    };
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email.toLowerCase().trim();

    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, password: true, userRole: true },
    });

    const isPasswordValid =
      !!user && (await bcrypt.compare(loginDto.password, user.password));

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException(
        AUTH_ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      );
    }
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.userRole,
    });

    return {
      message: AUTH_SUCCESS_MESSAGES.AUTH.LOGIN,
      accessToken,
    };
  }

  async createStaff(createStaffDto: CreateStaffDto, directorId: number) {
    const { userRole, doctorProfile, ...rest } = createStaffDto;

    const data = await this.dataSource.transaction(async (manager) => {
      const user = await this.createUser(rest, userRole, directorId, manager);

      if (userRole !== UserRole.DOCTOR || !doctorProfile) {
        return { ...user };
      }

      const licenseNumber = doctorProfile.licenseNumber.trim().toUpperCase();

      if (await manager.existsBy(Doctor, { licenseNumber })) {
        throw new ConflictException(
          DOCTOR_ERROR_MESSAGES.DOCTOR.LICENSE_IN_USE,
        );
      }

      const doctor = await manager.save(
        Doctor,
        manager.create(Doctor, {
          ...doctorProfile,
          licenseNumber,
          userId: user.id,
        }),
      );

      return {
        ...user,
        doctorProfile: {
          id: doctor.id,
          specialty: doctor.specialty,
          licenseNumber: doctor.licenseNumber,
          bio: doctor.bio,
          yearsOfExperience: doctor.yearsOfExperience,
          imageUrl: doctor.imageUrl,
        },
      };
    });

    return { message: AUTH_SUCCESS_MESSAGES.AUTH.REGISTERED, data };
  }

  async currentUser(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(USER_ERROR_MESSAGES.USER.NOT_FOUND);
    }
    return user;
  }

  private async createUser(
    registerDto: RegisterDto,
    userRole?: UserRole,
    createdById?: number,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(User) : this.userRepository;

    const email = registerDto.email.toLowerCase().trim();
    const { phoneNumber } = registerDto;

    if (await repo.existsBy({ email })) {
      throw new ConflictException(AUTH_ERROR_MESSAGES.AUTH.EMAIL_IN_USE);
    }
    if (await repo.existsBy({ phoneNumber })) {
      throw new ConflictException(AUTH_ERROR_MESSAGES.AUTH.PHONE_IN_USE);
    }

    const user = repo.create({
      ...registerDto,
      email,
      password: await bcrypt.hash(registerDto.password, 10),
      ...(userRole && { userRole }),
      ...(createdById && { createdById }),
    });
    await repo.save(user);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      userRole: user.userRole,
    };
  }
}
