-- Add app_description column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS app_description TEXT;

-- Create app_images table
CREATE TABLE IF NOT EXISTS app_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    image_type VARCHAR(50) NOT NULL,
    prompt TEXT,
    cloudinary_url TEXT NOT NULL,
    cloudinary_id VARCHAR(255) NOT NULL,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on document_id for faster queries
CREATE INDEX IF NOT EXISTS idx_app_images_document_id ON app_images(document_id);
