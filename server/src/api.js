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

router.post("/watchlist", async (req, res) => {
  const { title, year, poster_url, type, rating, notes } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const tableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'watchlist')"
    );
    
    if (!tableCheck.rows[0].exists) {
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
    }

    const result = await pool.query(
      "INSERT INTO watchlist (title, year, poster_url, type, rating, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, year, poster_url, type, rating || null, notes || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to add to watchlist", details: err.message });
  }
});

router.get("/watchlist", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM watchlist ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch watchlist", details: err.message });
  }
});

router.put("/watchlist/:id", async (req, res) => {
  const { id } = req.params;
  const { title, notes } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const checkResult = await pool.query("SELECT * FROM watchlist WHERE id = $1", [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Watchlist item not found" });
    }

    const result = await pool.query(
      "UPDATE watchlist SET notes = $1 WHERE id = $2 RETURNING *",
      [notes || null, id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update watchlist item", details: err.message });
  }
});

router.delete("/watchlist/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const checkResult = await pool.query("SELECT * FROM watchlist WHERE id = $1", [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Watchlist item not found" });
    }

    await pool.query("DELETE FROM watchlist WHERE id = $1", [id]);
    res.json({ 
      success: true, 
      message: "Watchlist item deleted successfully",
      deleted: checkResult.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete watchlist item", details: err.message });
  }
});

export default router;
