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
      throw new BadRequestException('Email already in use');
    }

    const existingPhone = await this.userRepository.findOneBy({
      phoneNumber,
    });

    if (existingPhone) {
      throw new BadRequestException('Phone number already in use');
    }

    const newUser = this.userRepository.create(createUserDto);

    await this.userRepository.save(newUser);

    return {
      message: 'User has been created',
      data: newUser,
    };
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const existUser = await this.userRepository.findOneBy({ id });
    if (!existUser) {
      throw new NotFoundException('User Does Not Exist');
    }
    return existUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existUser = await this.userRepository.findOneBy({ id });
    if (!existUser) {
      throw new NotFoundException('User Does Not Exist');
    }
    Object.assign(existUser, updateUserDto);
    await this.userRepository.save(existUser);
    return {
      message: 'User Has Updated Successfully',
      data: existUser,
    };
  }

  async remove(id: number) {
    const existUser = await this.userRepository.findOneBy({ id });
    if (!existUser) {
      throw new BadRequestException('User Does Not Exist');
    }
    await this.userRepository.remove(existUser);
    return {
      message: 'User Has Been Deleted Successfully',
      data: existUser,
    };
  }
}
