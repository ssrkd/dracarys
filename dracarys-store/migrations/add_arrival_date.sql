-- Add arrival_date to purchases table
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS arrival_date TIMESTAMPTZ;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_purchases_arrival_date ON purchases(arrival_date);
