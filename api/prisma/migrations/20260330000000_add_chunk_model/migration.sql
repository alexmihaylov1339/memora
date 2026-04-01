-- CreateTable
CREATE TABLE "Chunk" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chunk_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Chunk_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChunkCard" (
    "chunkId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "sequenceIndex" INTEGER NOT NULL,
    "offsetDays" INTEGER,

    CONSTRAINT "ChunkCard_pkey" PRIMARY KEY ("chunkId", "cardId"),
    CONSTRAINT "ChunkCard_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "Chunk"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChunkCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Chunk_deckId_idx" ON "Chunk"("deckId");

-- CreateIndex
CREATE INDEX "Chunk_deckId_position_idx" ON "Chunk"("deckId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ChunkCard_chunkId_sequenceIndex_key" ON "ChunkCard"("chunkId", "sequenceIndex");

-- CreateIndex
CREATE INDEX "ChunkCard_cardId_idx" ON "ChunkCard"("cardId");
