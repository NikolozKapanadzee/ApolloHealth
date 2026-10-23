import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './constants/user-error-messages';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const { email, phoneNumber } = createUserDto;

    const existingEmail = await this.userRepository.findOneBy({
      email,
    });

    if (existingEmail) {
      throw new BadRequestException(ERROR_MESSAGES.USER.EMAIL_IN_USE);
    }

    const existingPhone = await this.userRepository.findOneBy({
      phoneNumber,
    });

    if (existingPhone) {
      throw new BadRequestException(ERROR_MESSAGES.USER.PHONE_IN_USE);
    }

    const newUser = this.userRepository.create(createUserDto);

    await this.userRepository.save(newUser);

    return {
      message: SUCCESS_MESSAGES.USER.CREATED,
      data: newUser,
    };
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const existUser = await this.userRepository.findOneBy({ id });
    if (!existUser) {
      throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
    }
    return existUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existUser = await this.userRepository.findOneBy({ id });
    if (!existUser) {
      throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
    }
    Object.assign(existUser, updateUserDto);
    await this.userRepository.save(existUser);
    return {
      message: SUCCESS_MESSAGES.USER.UPDATED,
      data: existUser,
    };
  }

  async remove(id: number) {
    const existUser = await this.userRepository.findOneBy({ id });
    if (!existUser) {
      throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);
    }
    await this.userRepository.remove(existUser);
    return {
      message: SUCCESS_MESSAGES.USER.DELETED,
      data: existUser,
    };
  }
}
