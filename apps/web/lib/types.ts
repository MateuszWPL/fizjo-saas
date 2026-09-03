export interface BodyMarker {
  id: string;
  muscleGroup: string;
  painLevel: number;
  painType: string | null;
  note: string | null;
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
  recommendations: string | null;
  closedAt: string | null;
  therapist: { fullName: string };
}

export interface VisitDetail extends Visit {
  patient: { id: string; firstName: string; lastName: string };
}

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
