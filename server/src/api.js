import { Router } from "express";
import fetch from "node-fetch";
import { pool } from "./db.js";

const router = Router();

router.get("/search", async (req, res) => {
  const { title } = req.query;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const response = await fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${process.env.OMDB_API_KEY}`);
    const data = await response.json();

    if (data.Response === "False") return res.status(404).json({ error: data.Error });

    res.json({
      title: data.Title,
      year: data.Year,
      poster_url: data.Poster,
      type: data.Type
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from OMDb" });
  }
});

// Test database connection
router.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ 
      success: true, 
      message: "Database connected!",
      timestamp: result.rows[0].now 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: "Database connection failed",
      details: err.message 
    });
  }
});

// Create the favorites table (run this once to set up the database)
router.post("/setup-db", async (req, res) => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        year VARCHAR(10),
        poster_url TEXT,
        type VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await pool.query(createTableQuery);
    res.json({ 
      success: true, 
      message: "Favorites table created successfully!" 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: "Failed to create table",
      details: err.message 
    });
  }
});

// Save a favorite movie/show
router.post("/favorites", async (req, res) => {
  const { title, year, poster_url, type } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const result = await pool.query(
      "INSERT INTO favorites (title, year, poster_url, type) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, year, poster_url, type]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to save favorite", details: err.message });
  }
});

// Get all favorites
router.get("/favorites", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM favorites ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch favorites", details: err.message });
  }
});

export default router;
