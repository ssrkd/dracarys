-- Add yuan_price column to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS yuan_price INTEGER;
