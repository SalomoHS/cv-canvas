-- AlterTable
ALTER TABLE "CVVersion" ADD COLUMN     "crateId" TEXT;

-- CreateTable
CREATE TABLE "Crate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CVVersion" ADD CONSTRAINT "CVVersion_crateId_fkey" FOREIGN KEY ("crateId") REFERENCES "Crate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
