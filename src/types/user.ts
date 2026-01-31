export type Role = "student" | "organizer";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  rollNumber?: string;
  branch?: string;
  college?: string;
  organizerName?: string;
  photoURL?: string;
  phone?: string;
  calendarLink?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export default UserProfile;
