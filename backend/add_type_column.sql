-- Add type column to posts table if it doesn't exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS type VARCHAR(50) NOT NULL DEFAULT 'Video';

-- Update existing posts to have a type
UPDATE posts SET type = 'Video' WHERE type IS NULL; 