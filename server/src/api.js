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

// Create the watchlist table (run this once to set up the database)
router.post("/setup-db", async (req, res) => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS watchlist (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        year VARCHAR(10),
        poster_url TEXT,
        type VARCHAR(50),
        rating INTEGER CHECK (rating >= 0 AND rating <= 5),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await pool.query(createTableQuery);
    
    // Add rating and notes columns if they don't exist (for existing tables)
    try {
      await pool.query("ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 0 AND rating <= 5)");
      await pool.query("ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS notes TEXT");
    } catch (alterErr) {
      // Columns might already exist, ignore
    }
    
    res.json({ 
      success: true, 
      message: "Watchlist table created successfully!" 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: "Failed to create table",
      details: err.message 
    });
  }
});

// Add a movie/show to watchlist
router.post("/watchlist", async (req, res) => {
  const { title, year, poster_url, type, rating, notes } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const result = await pool.query(
      "INSERT INTO watchlist (title, year, poster_url, type, rating, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, year, poster_url, type, rating || null, notes || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to add to watchlist", details: err.message });
  }
});

// Get all watchlist items
router.get("/watchlist", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM watchlist ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch watchlist", details: err.message });
  }
});

// Update a watchlist item by ID
router.put("/watchlist/:id", async (req, res) => {
  const { id } = req.params;
  const { title, notes } = req.body;

  // Validate that title is provided (required field)
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    // Check if the watchlist item exists
    const checkResult = await pool.query("SELECT * FROM watchlist WHERE id = $1", [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Watchlist item not found" });
    }

    // Update the watchlist item (only notes can be updated, title is validated but not changed)
    console.log("Updating watchlist item:", { id, notes: notes || null });
    
    const result = await pool.query(
      "UPDATE watchlist SET notes = $1 WHERE id = $2 RETURNING *",
      [notes || null, id]
    );
    
    console.log("Update result:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update watchlist item", details: err.message });
  }
});

// Delete a watchlist item by ID
router.delete("/watchlist/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the watchlist item exists
    const checkResult = await pool.query("SELECT * FROM watchlist WHERE id = $1", [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Watchlist item not found" });
    }

    // Delete the watchlist item
    await pool.query("DELETE FROM watchlist WHERE id = $1", [id]);
    res.json({ 
      success: true, 
      message: "Watchlist item deleted successfully",
      deleted: checkResult.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete watchlist item", details: err.message });
  }
});

export default router;
