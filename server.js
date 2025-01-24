import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite/sqlite3';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Initialize database
let db;
(async () => {
  db = await open({
    filename: './businesses.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      address TEXT,
      phone TEXT,
      website TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
})();

app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const businessData = {
      name: $('h1').first().text().trim(),
      address: $('[itemprop="address"]').text().trim(),
      phone: $('[itemprop="telephone"]').text().trim(),
      website: $('[itemprop="url"]').attr('href')
    };

    await db.run(
      'INSERT INTO businesses (name, address, phone, website) VALUES (?, ?, ?, ?)',
      [businessData.name, businessData.address, businessData.phone, businessData.website]
    );

    res.json({ success: true, data: businessData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/businesses', async (req, res) => {
  try {
    const businesses = await db.all('SELECT * FROM businesses');
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
