export type Sex = "FEMALE" | "MALE";

export interface BodyMarker {
  id: string;
  muscleGroup: string;
  painLevel: number;
  painType: string | null;
  note: string | null;
}

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  defaultSets: number | null;
  defaultReps: number | null;
}

export interface Me {
  fullName: string;
  role: "OWNER" | "THERAPIST";
  clinic: { name: string };
}

export interface Therapist {
  id: string;
  fullName: string;
  licenseNumber: string | null;
  role: "OWNER" | "THERAPIST";
  active: boolean;
  email: string | null;
}

export interface ExercisePlanSummary {
  id: string;
  createdAt: string;
  therapist: { fullName: string };
  _count: { items: number };
}

export interface ExercisePlan {
  id: string;
  createdAt: string;
  note: string | null;
  therapist: { fullName: string };
  patient: { id: string; firstName: string; lastName: string; email: string | null };
  items: {
    id: string;
    sets: number | null;
    reps: number | null;
    note: string | null;
    exercise: { name: string; description: string | null };
  }[];
}

export interface PainHistoryVisit {
  id: string;
  visitDate: string;
  bodyMarkers: { muscleGroup: string; painLevel: number; painType: string | null }[];
}

export interface Visit {
  id: string;
  patientId: string;
  visitDate: string;
  interview: string | null;
  examination: string | null;
  diagnosis: string | null;
  icd10Code: string | null;
  treatment: string | null;
  recommendations: string | null;
  closedAt: string | null;
  therapist: { fullName: string };
}

export interface VisitAmendment {
  id: string;
  content: string;
  createdAt: string;
  author: { fullName: string };
}

export interface VisitDetail extends Visit {
  therapist: { fullName: string; licenseNumber: string | null };
  patient: { id: string; firstName: string; lastName: string };
  amendments: VisitAmendment[];
}

export interface RecentVisit {
  id: string;
  visitDate: string;
  closedAt: string | null;
  diagnosis: string | null;
  patient: { id: string; firstName: string; lastName: string };
  therapist: { fullName: string };
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  pesel: string | null;
  sex: Sex | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  archivedAt: string | null;
}
