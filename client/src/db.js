import Dexie from 'dexie';

// Initialize Dexie database
const db = new Dexie('YouToolsDB');

// Version 1: initial schema (without brand)
db.version(1).stores({
  products: '++id, name, description, price, original_price, code, badge, in_stock, image_url'
});

// Version 2: add brand field, migrating existing entries
db.version(2).stores({
  products: '++id, name, brand, description, price, original_price, code, badge, in_stock, image_url'
}).upgrade(async tx => {
  await tx.products.toCollection().modify(product => {
    if (product.brand === undefined) product.brand = '';
  });
});

export default db;
