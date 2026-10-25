import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from './constants/user-messages';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const existUser = await this.userRepository.findOneBy({ id });
    if (!existUser) {
      throw new NotFoundException(USER_ERROR_MESSAGES.USER.NOT_FOUND);
    }
    return existUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existUser = await this.userRepository.findOneBy({ id });
    if (!existUser) {
      throw new NotFoundException(USER_ERROR_MESSAGES.USER.NOT_FOUND);
    }
    Object.assign(existUser, updateUserDto);
    await this.userRepository.save(existUser);
    return {
      message: USER_SUCCESS_MESSAGES.USER.UPDATED,
      data: existUser,
    };
  }

  async remove(id: number) {
    const existUser = await this.userRepository.findOneBy({ id });
    if (!existUser) {
      throw new BadRequestException(USER_ERROR_MESSAGES.USER.NOT_FOUND);
    }
    await this.userRepository.remove(existUser);
    return {
      message: USER_SUCCESS_MESSAGES.USER.DELETED,
      data: existUser,
    };
  }
}
