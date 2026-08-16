// One-time script: reads local product images and saves them into the
// products table's `image` column as base64 data URLs.
//
// HOW TO RUN:
// 1. Copy this file into your backend folder (e.g. backend/seedProductImages.js)
// 2. From backend/, run:  node seedProductImages.js
//
// This assumes your image files live at:
//   ../src/assets/products/<filename>
// relative to the backend folder (adjust IMAGE_DIR below if different).

const fs = require('fs');
const path = require('path');
const pool = require('./db.js');

const IMAGE_DIR = path.resolve(__dirname, '../src/assets/products');

// Maps product id (matching your products table) to its local image filename.
const IMAGE_MAP = {
  1: 'rc-puppy.webp',
  2: 'rc-dog-adult.jpg',
  3: 'rc-cat-adult.jpg',
  4: 'rc-kitten.webp',
  5: 'vl-budgie-mix.jpg',
  6: 'taiyo-fish-food.png',
  7: 'tetra-goldfish.avif',
  8: 'cattle-mineral-block.jpg',
  9: 'udder-cream.jpg',
  10: 'goat-pellets.webp',
};

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

function toDataUrl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext];
  if (!mime) throw new Error(`Unknown image type for ${filePath}`);
  const buffer = fs.readFileSync(filePath);
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

async function run() {
  const ids = Object.keys(IMAGE_MAP).map(Number);
  let updated = 0;
  let skipped = 0;

  for (const id of ids) {
    const filename = IMAGE_MAP[id];
    const filePath = path.join(IMAGE_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`SKIP  id=${id}  file not found: ${filePath}`);
      skipped++;
      continue;
    }

    try {
      const dataUrl = toDataUrl(filePath);
      const [result] = await pool.query(
        'UPDATE products SET image = ? WHERE id = ?',
        [dataUrl, id]
      );
      if (result.affectedRows === 0) {
        console.log(`SKIP  id=${id}  no matching product row in database`);
        skipped++;
      } else {
        console.log(`OK    id=${id}  <- ${filename}`);
        updated++;
      }
    } catch (err) {
      console.error(`ERROR id=${id}  ${err.message}`);
      skipped++;
    }
  }

  console.log(`\nDone. Updated ${updated} product(s), skipped ${skipped}.`);
  process.exit(0);
}

run();