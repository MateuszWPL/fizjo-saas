-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('FEMALE', 'MALE');

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "address" TEXT,
ADD COLUMN     "pesel" TEXT,
ADD COLUMN     "sex" "Sex";

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "license_number" TEXT;

-- AlterTable
ALTER TABLE "visits" ADD COLUMN     "icd10_code" TEXT,
ADD COLUMN     "treatment" TEXT;

-- CreateTable
CREATE TABLE "visit_amendments" (
    "id" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visit_amendments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visit_amendments_visit_id_idx" ON "visit_amendments"("visit_id");

-- CreateIndex
CREATE UNIQUE INDEX "patients_clinic_id_pesel_key" ON "patients"("clinic_id", "pesel");

-- AddForeignKey
ALTER TABLE "visit_amendments" ADD CONSTRAINT "visit_amendments_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_amendments" ADD CONSTRAINT "visit_amendments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- adnotacje widzi i dopisuje tylko gabinet, do ktorego nalezy wizyta
ALTER TABLE "visit_amendments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY clinic_isolation ON visit_amendments FOR ALL TO app_api
  USING (visit_id IN (SELECT id FROM visits))
  WITH CHECK (visit_id IN (SELECT id FROM visits));
