import React, { useState, useEffect } from "react";
import "./MediaCard.css";

function MediaCard({ movie, isWatchlist = false, onWatchlistUpdate, onWatchlistDelete }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState(movie?.notes || "");

  // Update local state when movie prop changes
  useEffect(() => {
    if (movie) {
      setNotes(movie.notes || "");
    }
  }, [movie]);

  // Safety check: if movie is missing, don't render
  if (!movie || !movie.title) {
    return null;
  }


  const handleAddToWatchlist = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: movie.title,
          year: movie.year,
          poster_url: movie.poster_url,
          type: movie.type,
          notes: notes || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Added to watchlist!");
        if (onWatchlistUpdate) {
          onWatchlistUpdate();
        }
      } else {
        const error = await res.json();
        alert(`Failed to add: ${error.error}`);
      }
    } catch (err) {
      console.error("Add failed:", err);
      alert("Failed to add to watchlist");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to remove this from your watchlist?")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/watchlist/${movie.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Removed from watchlist!");
        if (onWatchlistDelete) {
          onWatchlistDelete();
        }
      } else {
        const error = await res.json();
        alert(`Failed to remove: ${error.error}`);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to remove from watchlist");
    }
  };

  const handleUpdate = async () => {
    if (!movie.id) {
      alert("Error: Movie ID is missing");
      return;
    }

    try {
      const updateData = {
        title: movie.title,
        notes: notes ? notes.trim() : null,
      };

      console.log("Sending update with data:", updateData);

      const res = await fetch(`http://localhost:4000/api/watchlist/${movie.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const updatedData = await res.json();
        console.log("Update response from server:", updatedData);
        
        // Update local state with the response data immediately
        setNotes(updatedData.notes || "");
        
        // Refresh the watchlist to sync with server
        if (onWatchlistUpdate) {
          try {
            await onWatchlistUpdate();
          } catch (refreshErr) {
            console.error("Failed to refresh watchlist:", refreshErr);
          }
        }
        // Close edit mode after data is refreshed
        setIsUpdating(false);
        alert("Updated successfully!");
      } else {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("Update failed with error:", error);
        alert(`Failed to update: ${error.error || "Unknown error"}`);
        // Keep edit mode open if update failed
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert(`Failed to update watchlist item: ${err.message}`);
      // Keep edit mode open if update failed
    }
  };

  return (
    <div className={`media-card ${isWatchlist ? "watchlist-card" : ""}`}>
      {isUpdating ? (
        <div className="update-form">
          <div className="card-poster">
            {movie.poster_url && movie.poster_url !== "N/A" && movie.poster_url.trim() !== "" ? (
              <img src={movie.poster_url} alt={movie.title} />
            ) : (
              <div className="poster-placeholder">
                <span>No Image</span>
              </div>
            )}
          </div>
          
          <div className="card-content">
            <h3 className="card-title">{movie.title}</h3>
            <p className="card-year">{movie.year}</p>
            {movie.type && (
              <span className="card-type">{movie.type}</span>
            )}
            
            <div className="form-group">
              <label htmlFor="notes">Your Thoughts</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you think of this?"
                rows="4"
                className="notes-textarea"
              />
            </div>
            
            <div className="button-group">
              <button onClick={handleUpdate} className="btn btn-primary">
                Save
              </button>
              <button onClick={() => setIsUpdating(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="card-poster">
            {movie.poster_url && movie.poster_url !== "N/A" && movie.poster_url.trim() !== "" ? (
              <img src={movie.poster_url} alt={movie.title} />
            ) : (
              <div className="poster-placeholder">
                <span>No Image</span>
              </div>
            )}
          </div>
          
          <div className="card-content">
            <h3 className="card-title">{movie.title}</h3>
            <p className="card-year">{movie.year}</p>
            {movie.type && (
              <span className="card-type">{movie.type}</span>
            )}
            
            {isWatchlist && (
              <div className="watchlist-details">
                {movie.notes && (
                  <div className="notes-display">
                    <p className="notes-label">Your Notes:</p>
                    <p className="notes-text">{movie.notes}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="card-actions">
              {!isWatchlist ? (
                <button onClick={handleAddToWatchlist} className="btn btn-primary btn-full">
                  Add to Watchlist
                </button>
              ) : (
                <>
                  <button onClick={() => setIsUpdating(true)} className="btn btn-primary">
                    Edit Notes
                  </button>
                  <button onClick={handleDelete} className="btn btn-danger">
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MediaCard;
