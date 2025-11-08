-- ============================================
-- MIGRATION: Add images column to products table
-- Safe to run on existing database
-- ============================================

-- Step 1: Add the images column (safe - uses IF NOT EXISTS)
-- This will NOT affect existing data or the image column
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images jsonb;

-- Step 2: (OPTIONAL) Migrate existing single images to images array
-- Uncomment the following lines if you want to populate the images array
-- with existing image values. This is optional - the app will work fine
-- without this, as it handles backward compatibility.

-- UPDATE public.products
-- SET images = jsonb_build_array(image)
-- WHERE image IS NOT NULL 
--   AND image != ''
--   AND (images IS NULL OR jsonb_array_length(images) = 0);

-- Verify the migration (run this to check):
-- SELECT id, name, image, images FROM public.products LIMIT 5;

-- ============================================
-- NOTES:
-- 1. The 'image' column remains untouched - all existing data is safe
-- 2. The 'images' column will be NULL for existing products (this is OK)
-- 3. The application handles backward compatibility automatically
-- 4. New products can use the images array, old products still work with image field
-- ============================================

