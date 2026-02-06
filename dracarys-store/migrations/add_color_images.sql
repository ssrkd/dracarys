-- Add color_images column to products table
-- It stores a JSONB object where keys are color names and values are arrays of image URLs
-- Example: { "Black": ["url1", "url2"], "White": ["url3"] }

ALTER TABLE products ADD COLUMN IF NOT EXISTS color_images JSONB DEFAULT '{}'::jsonb;
