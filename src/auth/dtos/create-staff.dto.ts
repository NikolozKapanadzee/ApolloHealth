import { IsDefined, IsIn, ValidateIf, ValidateNested } from 'class-validator';
import { UserRole } from '../../common/enums/UserRole.enum';
import { RegisterDto } from './register.dto';
import { Type } from 'class-transformer';
import { CreateDoctorProfileDto } from '../../doctors/dto/create-doctor-profile.dto';

export class CreateStaffDto extends RegisterDto {
  @IsIn([UserRole.DOCTOR, UserRole.RECEPTIONIST])
  userRole: UserRole.DOCTOR | UserRole.RECEPTIONIST;

  @ValidateIf((o) => o.userRole === UserRole.DOCTOR)
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateDoctorProfileDto)
  doctorProfile?: CreateDoctorProfileDto;
}
