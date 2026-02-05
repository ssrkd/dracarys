-- Migration: Add per-color visibility support
-- Add hidden_colors array to products to allow hiding specific variants
ALTER TABLE IF EXISTS public.products 
ADD COLUMN IF NOT EXISTS hidden_colors TEXT[] DEFAULT '{}';
