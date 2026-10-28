import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { IsAuthGuard } from '../guards/isAuthGuard.guard';

@Controller('doctors')
@UseGuards(IsAuthGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDoctorProfileDto: UpdateDoctorProfileDto,
  ) {
    return this.doctorsService.update(+id, updateDoctorProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(+id);
  }
}
