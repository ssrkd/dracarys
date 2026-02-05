-- Add order_date to purchases table
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS order_date TIMESTAMPTZ DEFAULT NOW();

-- Add sale_date to sales table  
ALTER TABLE sales ADD COLUMN IF NOT EXISTS sale_date TIMESTAMPTZ DEFAULT NOW();

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_purchases_order_date ON purchases(order_date);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
