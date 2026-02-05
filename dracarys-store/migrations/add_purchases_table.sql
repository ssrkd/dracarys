-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost INTEGER,
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    size TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    purchase_price INTEGER NOT NULL,
    source_app INTEGER NOT NULL CHECK (source_app IN (1, 2)),
    category TEXT NOT NULL,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'arrived', 'listed', 'archived')),
    delivery_cost INTEGER,
    total_cost INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage purchases
-- PostgreSQL doesn't support IF NOT EXISTS for policies, so we drop if it exists first
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON purchases;

CREATE POLICY "Enable all operations for authenticated users" 
ON purchases FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
