export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  archivedAt: string | null;
}
