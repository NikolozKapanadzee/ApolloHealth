import { IsEnum } from 'class-validator';
import { UserRole } from '../../common/enums/UserRole.enum';
import { RegisterDto } from './register.dto';

export class CreateStaffDto extends RegisterDto {
  @IsEnum(UserRole)
  userRole: UserRole;
}
