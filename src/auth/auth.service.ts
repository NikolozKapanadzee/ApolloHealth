import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
} from './constants/auth-messages';
import * as bcrypt from 'bcrypt';
import { USER_ERROR_MESSAGES } from '../users/constants/user-messages';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase().trim();
    const { phoneNumber } = registerDto;
    const emailInUse = await this.userRepository.existsBy({ email });
    if (emailInUse) {
      throw new ConflictException(AUTH_ERROR_MESSAGES.AUTH.EMAIL_IN_USE);
    }
    const phoneInUse = await this.userRepository.existsBy({ phoneNumber });
    if (phoneInUse) {
      throw new ConflictException(AUTH_ERROR_MESSAGES.AUTH.PHONE_IN_USE);
    }
    const user = this.userRepository.create({
      ...registerDto,
      email,
      password: await bcrypt.hash(registerDto.password, 10),
    });
    await this.userRepository.save(user);
    return {
      message: AUTH_SUCCESS_MESSAGES.AUTH.REGISTERED,
      data: user,
    };
  }
  async login(loginDto: LoginDto) {
    const email = loginDto.email.toLowerCase().trim();
    const { password } = loginDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        password: true,
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userRole: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(USER_ERROR_MESSAGES.USER.NOT_FOUND);
    }
    console.log(user);

    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      throw new BadRequestException(
        AUTH_ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      );
    }
    const payload = { sub: user.id, role: user.userRole };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      message: AUTH_SUCCESS_MESSAGES.AUTH.LOGIN,
      accessToken: accessToken,
    };
  }
}
