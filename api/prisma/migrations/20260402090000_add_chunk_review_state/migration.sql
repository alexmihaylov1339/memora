CREATE TABLE "ChunkReviewState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chunkId" TEXT NOT NULL,
    "due" DATETIME NOT NULL,
    "consecutiveSuccessCount" INTEGER NOT NULL DEFAULT 0,
    "lastGrade" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChunkReviewState_chunkId_fkey"
      FOREIGN KEY ("chunkId") REFERENCES "Chunk" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ChunkReviewState_chunkId_key" ON "ChunkReviewState"("chunkId");
CREATE INDEX "ChunkReviewState_due_idx" ON "ChunkReviewState"("due");
