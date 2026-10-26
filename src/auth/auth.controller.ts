import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { UserId } from '../decorators/user.decorator';
import { IsAuthGuard } from '../guards/isAuthGuard.guard';
import { CreateStaffDto } from './dtos/create-staff.dto';
import { RolesGuard } from '../guards/rolesGuard.guard';
import { Roles } from '../decorators/role.decorator';
import { UserRole } from '../common/enums/UserRole.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(IsAuthGuard)
  @Get('current-user')
  currentUser(@UserId() userId: number) {
    return this.authService.currentUser(userId);
  }

  @UseGuards(IsAuthGuard, RolesGuard)
  @Roles(UserRole.DIRECTOR)
  @Post('staff')
  createStaff(
    @Body() createStaffDto: CreateStaffDto,
    @UserId() directorId: number,
  ) {
    return this.authService.createStaff(createStaffDto, directorId);
  }
}
