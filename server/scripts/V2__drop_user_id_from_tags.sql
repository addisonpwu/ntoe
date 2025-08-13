-- V2.2: Drop user_id from tags table to make tags global and admin-managed.

-- Drop the foreign key constraint if it exists.
SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tags' AND CONSTRAINT_NAME = 'fk_user_id_tags');
SET @s = IF(@fk_exists > 0, 'ALTER TABLE tags DROP FOREIGN KEY fk_user_id_tags', 'SELECT "Foreign key fk_user_id_tags does not exist, skipping." AS ""');
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop the column if it exists.
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'tags' AND table_schema = DATABASE() AND column_name = 'user_id');
SET @s = IF(@col_exists > 0, 'ALTER TABLE tags DROP COLUMN user_id', 'SELECT "Column user_id does not exist in tags table, skipping." AS ""');
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
