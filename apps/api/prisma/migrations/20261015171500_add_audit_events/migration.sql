-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('PATIENT_VIEWED', 'PATIENT_CREATED', 'PATIENT_UPDATED', 'PATIENT_ARCHIVED', 'VISIT_VIEWED', 'VISIT_CREATED', 'VISIT_UPDATED', 'VISIT_CLOSED', 'VISIT_AMENDED', 'PLAN_CREATED', 'PLAN_PDF_DOWNLOADED', 'PLAN_EMAILED', 'THERAPIST_CREATED', 'THERAPIST_DEACTIVATED', 'THERAPIST_RESTORED');

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "action" "AuditAction" NOT NULL,
    "patient_id" UUID,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_events_clinic_id_created_at_idx" ON "audit_events"("clinic_id", "created_at");

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- dziennik jest tylko do dopisywania: API moze dodawac i czytac wpisy
-- swojego gabinetu, ale nie moze ich zmieniac ani usuwac
REVOKE UPDATE, DELETE ON "audit_events" FROM app_api;

ALTER TABLE "audit_events" ENABLE ROW LEVEL SECURITY;

CREATE POLICY clinic_read ON audit_events FOR SELECT TO app_api
  USING (clinic_id = current_clinic_id());

-- wpis moze dodac tylko zalogowany terapeuta i tylko we wlasnym imieniu
CREATE POLICY clinic_insert ON audit_events FOR INSERT TO app_api
  WITH CHECK (clinic_id = current_clinic_id() AND actor_id = current_app_user_id());
