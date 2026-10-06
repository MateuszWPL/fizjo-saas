-- CreateTable
CREATE TABLE "exercise_plans" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "therapist_id" UUID NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_plan_items" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "sets" INTEGER,
    "reps" INTEGER,
    "note" TEXT,

    CONSTRAINT "exercise_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exercise_plans_patient_id_idx" ON "exercise_plans"("patient_id");

-- CreateIndex
CREATE INDEX "exercise_plan_items_plan_id_idx" ON "exercise_plan_items"("plan_id");

-- AddForeignKey
ALTER TABLE "exercise_plans" ADD CONSTRAINT "exercise_plans_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_plans" ADD CONSTRAINT "exercise_plans_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_plan_items" ADD CONSTRAINT "exercise_plan_items_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "exercise_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_plan_items" ADD CONSTRAINT "exercise_plan_items_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
