import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../common/enums/UserRole.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  email: string;
  @Column({ select: false })
  password: string;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column({ unique: true })
  phoneNumber: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  userRole: UserRole;
}
