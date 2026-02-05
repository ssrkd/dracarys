-- Migration: Add item_url to purchases table
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS item_url TEXT;
