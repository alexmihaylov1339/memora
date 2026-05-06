-- Add standalone card review streak state.
-- Existing Deck Inbox chunks are intentionally left as-is for now; they continue
-- to work as user-visible chunks under the one-card-per-session chunk model.
ALTER TABLE "ReviewState"
ADD COLUMN "consecutiveSuccessCount" INTEGER NOT NULL DEFAULT 0;
