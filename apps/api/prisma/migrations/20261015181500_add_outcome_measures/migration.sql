-- CreateEnum
CREATE TYPE "OutcomeType" AS ENUM ('ODI', 'NDI');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'OUTCOME_RECORDED';

-- CreateTable
CREATE TABLE "outcome_measures" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "therapist_id" UUID NOT NULL,
    "type" "OutcomeType" NOT NULL,
    "answers" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outcome_measures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outcome_measures_patient_id_idx" ON "outcome_measures"("patient_id");

-- AddForeignKey
ALTER TABLE "outcome_measures" ADD CONSTRAINT "outcome_measures_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_measures" ADD CONSTRAINT "outcome_measures_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- pomiary sa czescia dokumentacji: API moze je dodawac i czytac,
-- ale nie zmieniac ani usuwac
REVOKE UPDATE, DELETE ON "outcome_measures" FROM app_api;

ALTER TABLE "outcome_measures" ENABLE ROW LEVEL SECURITY;

CREATE POLICY clinic_isolation ON outcome_measures FOR ALL TO app_api
  USING (patient_id IN (SELECT id FROM patients))
  WITH CHECK (patient_id IN (SELECT id FROM patients));
