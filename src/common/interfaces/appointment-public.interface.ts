import { AppointmentStatus } from '../enums/AppointmentStatus.enum';

export interface AppointmentPublic {
  id: number;
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  doctorId: number;
  doctorFirstName: string;
  doctorLastName: string;
  doctorSpecialty: string;
  scheduledAt: Date;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
