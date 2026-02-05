-- Migration: Add color column to products table
ALTER TABLE IF EXISTS public.products 
ADD COLUMN IF NOT EXISTS color TEXT;
