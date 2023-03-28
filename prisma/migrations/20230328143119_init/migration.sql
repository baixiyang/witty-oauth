/*
  Warnings:

  - The `scopes` column on the `Client` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "redirectUris" SET DEFAULT ARRAY[]::VARCHAR(512)[],
DROP COLUMN "scopes",
ADD COLUMN     "scopes" "ClientScope"[] DEFAULT ARRAY['read', 'white']::"ClientScope"[];
