CREATE TYPE "DeckSharePermission" AS ENUM ('view', 'edit');

CREATE TABLE "DeckShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deckId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "DeckSharePermission" NOT NULL DEFAULT 'view',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "DeckShare_deckId_userId_key" ON "DeckShare"("deckId", "userId");
CREATE INDEX "DeckShare_deckId_idx" ON "DeckShare"("deckId");
CREATE INDEX "DeckShare_userId_idx" ON "DeckShare"("userId");

ALTER TABLE "DeckShare" ADD CONSTRAINT "DeckShare_deckId_fkey"
  FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DeckShare" ADD CONSTRAINT "DeckShare_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
