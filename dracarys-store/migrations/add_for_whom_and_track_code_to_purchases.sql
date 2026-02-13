-- Add for_whom and track_code columns to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS for_whom TEXT CHECK (for_whom IN ('business', 'myself', 'home')) DEFAULT 'business',
ADD COLUMN IF NOT EXISTS track_code TEXT;
