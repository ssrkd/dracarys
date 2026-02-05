-- Migration: Add multi-color support
-- 1. Add colors array to products
ALTER TABLE IF EXISTS public.products 
ADD COLUMN IF NOT EXISTS colors TEXT[];

-- 2. Ensure color column exists in products (for backward compatibility or single primary color)
ALTER TABLE IF EXISTS public.products 
ADD COLUMN IF NOT EXISTS color TEXT;

-- 3. Add color back to purchases
ALTER TABLE IF EXISTS public.purchases 
ADD COLUMN IF NOT EXISTS color TEXT;

-- 4. Add color back to sales
ALTER TABLE IF EXISTS public.sales 
ADD COLUMN IF NOT EXISTS color TEXT;
