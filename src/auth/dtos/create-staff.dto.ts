import { IsIn } from 'class-validator';
import { UserRole } from '../../common/enums/UserRole.enum';
import { RegisterDto } from './register.dto';

export class CreateStaffDto extends RegisterDto {
  @IsIn([UserRole.DOCTOR, UserRole.RECEPTIONIST])
  userRole: UserRole.DOCTOR | UserRole.RECEPTIONIST;
}
