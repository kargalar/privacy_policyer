-- Add short_description and long_description columns to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS long_description TEXT;

-- Add style column to app_images table
ALTER TABLE app_images ADD COLUMN IF NOT EXISTS style VARCHAR(100);
