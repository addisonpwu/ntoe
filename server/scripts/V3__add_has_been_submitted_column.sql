-- V3: Add has_been_submitted column to notes table.

-- Add the column if it doesn't exist to make the script idempotent.
SET @s = (SELECT IF(
  (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE table_name = 'notes'
  AND table_schema = DATABASE()
  AND column_name = 'has_been_submitted'
  ) = 0,
  "ALTER TABLE notes ADD COLUMN has_been_submitted BOOLEAN NOT NULL DEFAULT FALSE",
  "SELECT 'Column has_been_submitted already exists in notes table, skipping.' AS ''"
));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
