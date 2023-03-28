-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'SYSTEM_ADMIN');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('SYSTEM', 'NORMAL');

-- CreateEnum
CREATE TYPE "ClientScope" AS ENUM ('read', 'white');

-- CreateEnum
CREATE TYPE "GrantType" AS ENUM ('authorization_code', 'refresh_token', 'client_credentials');

-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(64) NOT NULL,
    "username" VARCHAR(256) NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "email" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" VARCHAR(64) NOT NULL,
    "desc" VARCHAR(256),
    "client_id" VARCHAR(256) NOT NULL,
    "client_secret" VARCHAR(256) NOT NULL,
    "type" "ClientType" NOT NULL DEFAULT 'NORMAL',
    "redirectUris" VARCHAR(512)[] DEFAULT ARRAY[]::VARCHAR(512)[],
    "grantTypes" "GrantType"[] DEFAULT ARRAY['authorization_code', 'refresh_token', 'client_credentials']::"GrantType"[],
    "scopes" TEXT[] DEFAULT ARRAY['all']::TEXT[],
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClientToUser" (
    "A" VARCHAR(64) NOT NULL,
    "B" VARCHAR(64) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_id_key" ON "Client"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Client_client_id_key" ON "Client"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "_ClientToUser_AB_unique" ON "_ClientToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ClientToUser_B_index" ON "_ClientToUser"("B");

-- AddForeignKey
ALTER TABLE "_ClientToUser" ADD CONSTRAINT "_ClientToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientToUser" ADD CONSTRAINT "_ClientToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
