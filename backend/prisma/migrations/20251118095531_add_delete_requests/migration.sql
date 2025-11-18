-- CreateTable
CREATE TABLE "delete_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delete_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "delete_requests" ADD CONSTRAINT "delete_requests_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
