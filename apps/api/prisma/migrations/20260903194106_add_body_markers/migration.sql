-- CreateTable
CREATE TABLE "body_markers" (
    "id" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "muscle_group" TEXT NOT NULL,
    "pain_level" INTEGER NOT NULL,
    "pain_type" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "body_markers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "body_markers_visit_id_muscle_group_key" ON "body_markers"("visit_id", "muscle_group");

-- AddForeignKey
ALTER TABLE "body_markers" ADD CONSTRAINT "body_markers_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
