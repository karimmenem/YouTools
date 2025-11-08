# Migration Guide: Adding Multiple Images Support

## Overview
This migration adds support for multiple images (up to 5) per product while maintaining 100% backward compatibility with existing data.

## Safety Notes
✅ **SAFE TO RUN** - This migration:
- Uses `IF NOT EXISTS` - won't error if column already exists
- Does NOT modify existing data
- Does NOT delete or change the `image` column
- Only adds a new `images` column (nullable JSONB)

## Step-by-Step Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. **Backup Your Data (Optional but Recommended)**
   - Go to Supabase Dashboard → Database → Backups
   - Create a backup or note the last backup time

2. **Open SQL Editor**
   - Go to Supabase Dashboard → SQL Editor
   - Click "New Query"

3. **Run the Migration**
   - Copy the contents of `client/migration_add_images_column.sql`
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl/Cmd + Enter`

4. **Verify the Migration**
   ```sql
   -- Check that the column was added
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'products' AND column_name = 'images';
   
   -- Verify existing data is intact
   SELECT id, name, image, images FROM products LIMIT 5;
   ```

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or run the migration directly
psql -h your-db-host -U postgres -d postgres -f client/migration_add_images_column.sql
```

## What Happens to Existing Data?

### Before Migration:
- Products have `image` column with single image URL
- Example: `image = 'https://example.com/image.jpg'`

### After Migration:
- Products still have `image` column (unchanged) ✅
- Products now also have `images` column (NULL for existing products)
- Example: 
  - `image = 'https://example.com/image.jpg'` (still there)
  - `images = NULL` (new column, empty for now)

### Application Behavior:
- **Existing products**: Continue to work exactly as before
- **New products**: Can use the `images` array (up to 5 images)
- **Backward compatibility**: The app automatically handles both formats

## Optional: Migrate Existing Images to Array

If you want to populate the `images` array for existing products, run this **after** the migration:

```sql
-- Migrate existing single images to images array
UPDATE public.products
SET images = jsonb_build_array(image)
WHERE image IS NOT NULL 
  AND image != ''
  AND (images IS NULL OR jsonb_array_length(COALESCE(images, '[]'::jsonb)) = 0);
```

**Note**: This is completely optional. The app works fine without it because:
- The `normalizeProductImages()` function in `productService.js` automatically converts single `image` to `images` array
- Existing products will continue to display their single image correctly

## Rollback (If Needed)

If you need to rollback (remove the column):

```sql
-- ⚠️ WARNING: Only run this if you're sure you want to remove the column
-- This will delete the images column but NOT the image column
ALTER TABLE public.products DROP COLUMN IF EXISTS images;
```

## Testing After Migration

1. **Verify existing products still work:**
   - Open your app
   - View existing products
   - They should display normally with their single image

2. **Test new product with multiple images:**
   - Go to Admin Panel → Add Product
   - Upload 2-5 images
   - Save the product
   - View the product detail page
   - You should see an indicator showing number of images
   - Click the image to open the gallery

3. **Test backward compatibility:**
   - Add a product with just one image (using URL or upload)
   - It should work the same as before

## Troubleshooting

### Error: "column already exists"
- This means the migration already ran
- You can safely ignore this error
- Verify with: `SELECT images FROM products LIMIT 1;`

### Existing products not showing images
- Check if `image` column still has data: `SELECT image FROM products LIMIT 5;`
- The app should automatically use the `image` column for backward compatibility
- Clear browser cache and refresh

### New products not saving multiple images
- Verify the migration ran successfully
- Check browser console for errors
- Verify the `images` column exists in the database

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify the database schema in Supabase Dashboard
3. Ensure all code changes are deployed
4. Check that the migration SQL ran without errors

