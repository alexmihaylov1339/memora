-- Add deck-level review interval configuration.
-- Null means the deck uses the application default interval sequence.
ALTER TABLE "Deck" ADD COLUMN "reviewIntervalHours" JSONB;
