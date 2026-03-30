-- CreateTable
CREATE TABLE "Chunk" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cardIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chunk_deckId_idx" ON "Chunk"("deckId");

-- CreateIndex
CREATE INDEX "Chunk_deckId_position_idx" ON "Chunk"("deckId", "position");

-- AddForeignKey
ALTER TABLE "Chunk" ADD CONSTRAINT "Chunk_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
