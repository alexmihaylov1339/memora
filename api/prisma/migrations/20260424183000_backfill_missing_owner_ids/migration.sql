-- Ensure ownerId is always populated for legacy/orphaned rows.
-- We use a deterministic system user so ownership is explicit and query-safe.
INSERT INTO "User" ("id", "email", "name", "createdAt", "updatedAt")
VALUES (
  'system_orphaned_owner',
  'system.orphaned-owner@memora.local',
  'System Orphaned Owner',
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO NOTHING;

UPDATE "Deck" AS d
SET "ownerId" = u."id"
FROM "User" AS u
WHERE u."email" = 'system.orphaned-owner@memora.local'
  AND d."ownerId" IS NULL;

UPDATE "Card" AS c
SET "ownerId" = d."ownerId"
FROM "Deck" AS d
WHERE c."deckId" = d."id"
  AND c."ownerId" IS NULL;

UPDATE "Chunk" AS c
SET "ownerId" = d."ownerId"
FROM "Deck" AS d
WHERE c."deckId" = d."id"
  AND c."ownerId" IS NULL;

UPDATE "Card" AS c
SET "ownerId" = u."id"
FROM "User" AS u
WHERE u."email" = 'system.orphaned-owner@memora.local'
  AND c."ownerId" IS NULL;

UPDATE "Chunk" AS c
SET "ownerId" = u."id"
FROM "User" AS u
WHERE u."email" = 'system.orphaned-owner@memora.local'
  AND c."ownerId" IS NULL;
