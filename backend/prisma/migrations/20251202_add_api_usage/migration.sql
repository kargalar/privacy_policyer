-- CreateTable
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    usage_type VARCHAR(50) NOT NULL, -- 'DOCUMENT_GENERATION', 'IMAGE_GENERATION'
    model_name VARCHAR(100) NOT NULL, -- 'gemini-2.5-flash', 'gemini-3-pro-image-preview'
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    cost_usd DECIMAL(10, 6) DEFAULT 0, -- Cost in USD (up to 6 decimal places)
    metadata JSONB, -- Additional info like image type, style, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_document_id ON api_usage(document_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);
