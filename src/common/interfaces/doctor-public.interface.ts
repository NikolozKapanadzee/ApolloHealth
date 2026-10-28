export interface DoctorPublicProfile {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  bio: string | null;
  yearsOfExperience: number;
  imageUrl: string | null;
}
