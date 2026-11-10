import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { IsAuthGuard } from '../guards/isAuthGuard.guard';
import { RolesGuard } from '../guards/rolesGuard.guard';
import { Roles } from '../decorators/role.decorator';
import { UserRole } from '../common/enums/UserRole.enum';
import { CurrentUser } from '../decorators/user.decorator';
import { AuthUser } from '../common/interfaces/auth.interface';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';

@Controller('appointments')
@UseGuards(IsAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT, UserRole.RECEPTIONIST, UserRole.DIRECTOR)
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() currentUser: AuthUser,
  ) {
    return this.appointmentsService.create(createAppointmentDto, currentUser);
  }

  @Get()
  findAll(
    @Query() query: FindAppointmentsQueryDto,
    @CurrentUser() currentUser: AuthUser,
  ) {
    return this.appointmentsService.findAll(query, currentUser);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthUser,
  ) {
    return this.appointmentsService.findOne(id, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @CurrentUser() currentUser: AuthUser,
  ) {
    return this.appointmentsService.update(
      id,
      updateAppointmentDto,
      currentUser,
    );
  }

  @Delete(':id')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthUser,
  ) {
    return this.appointmentsService.cancel(id, currentUser);
  }
}
