import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { IsAuthGuard } from '../guards/isAuthGuard.guard';
import { FindDoctorsQueryDto } from './dto/find-doctors-query.dto';
import { RolesGuard } from '../guards/rolesGuard.guard';
import { Roles } from '../decorators/role.decorator';
import { UserRole } from '../common/enums/UserRole.enum';
import { CurrentUser } from '../decorators/user.decorator';
import { AuthUser } from '../common/interfaces/auth.interface';

@Controller('doctors')
@UseGuards(IsAuthGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  findAll(@Query() findDoctorsQueryDto: FindDoctorsQueryDto) {
    return this.doctorsService.findAll(findDoctorsQueryDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DIRECTOR, UserRole.DOCTOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDoctorProfileDto: UpdateDoctorProfileDto,
    @CurrentUser() currentUser: AuthUser,
  ) {
    return this.doctorsService.update(id, updateDoctorProfileDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DIRECTOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.remove(id);
  }
}
