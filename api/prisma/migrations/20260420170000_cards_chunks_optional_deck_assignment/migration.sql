ALTER TABLE "Card" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "Chunk" ADD COLUMN "ownerId" TEXT;

UPDATE "Card" AS c
SET "ownerId" = d."ownerId"
FROM "Deck" AS d
WHERE c."deckId" = d."id";

UPDATE "Chunk" AS c
SET "ownerId" = d."ownerId"
FROM "Deck" AS d
WHERE c."deckId" = d."id";

ALTER TABLE "Card" ALTER COLUMN "deckId" DROP NOT NULL;
ALTER TABLE "Chunk" ALTER COLUMN "deckId" DROP NOT NULL;

DROP INDEX IF EXISTS "Chunk_deckId_position_idx";
CREATE INDEX "Chunk_ownerId_idx" ON "Chunk"("ownerId");
CREATE INDEX "Chunk_deckId_position_idx" ON "Chunk"("deckId", "position");

CREATE INDEX "Card_ownerId_idx" ON "Card"("ownerId");

ALTER TABLE "Card" DROP CONSTRAINT IF EXISTS "Card_deckId_fkey";
ALTER TABLE "Chunk" DROP CONSTRAINT IF EXISTS "Chunk_deckId_fkey";

ALTER TABLE "Card"
  ADD CONSTRAINT "Card_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Chunk"
  ADD CONSTRAINT "Chunk_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Card"
  ADD CONSTRAINT "Card_deckId_fkey"
  FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Chunk"
  ADD CONSTRAINT "Chunk_deckId_fkey"
  FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE SET NULL ON UPDATE CASCADE;
