-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversations_integrationId_contactNumber_key" ON "conversations"("integrationId", "contactNumber");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
