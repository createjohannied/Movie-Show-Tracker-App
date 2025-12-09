import React, { useState, useEffect } from "react";
import Rating from "./Rating";
import "./MediaCard.css";

function MediaCard({ movie, isFavorite = false, onFavoriteUpdate, onFavoriteDelete }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [rating, setRating] = useState(movie.rating || 0);
  const [notes, setNotes] = useState(movie.notes || "");

  // Update local state when movie prop changes
  useEffect(() => {
    setRating(movie.rating || 0);
    setNotes(movie.notes || "");
  }, [movie]);

  const handleSaveToFavorites = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: movie.title,
          year: movie.year,
          poster_url: movie.poster_url,
          type: movie.type,
          rating: rating || null,
          notes: notes || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Saved to favorites!");
        if (onFavoriteUpdate) {
          onFavoriteUpdate();
        }
      } else {
        const error = await res.json();
        alert(`Failed to save: ${error.error}`);
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save to favorites");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this favorite?")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/favorites/${movie.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Deleted successfully!");
        if (onFavoriteDelete) {
          onFavoriteDelete();
        }
      } else {
        const error = await res.json();
        alert(`Failed to delete: ${error.error}`);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete favorite");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/favorites/${movie.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: rating || null,
          notes: notes || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Updated successfully!");
        setIsUpdating(false);
        if (onFavoriteUpdate) {
          onFavoriteUpdate();
        }
      } else {
        const error = await res.json();
        alert(`Failed to update: ${error.error}`);
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update favorite");
    }
  };

  return (
    <div className={`media-card ${isFavorite ? "favorite-card" : ""}`}>
      {isUpdating ? (
        <div className="update-form">
          <h3 className="card-title">{movie.title}</h3>
          <p className="card-year">{movie.year}</p>
          
          <div className="form-group">
            <label>Rating</label>
            <Rating 
              rating={rating} 
              onRatingChange={setRating}
              editable={true}
            />
          </div>
          
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
      ) : (
        <>
          <div className="card-poster">
            {movie.poster_url && movie.poster_url !== "N/A" ? (
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
            
            {isFavorite && (
              <div className="favorite-details">
                {movie.rating > 0 && (
                  <div className="rating-display">
                    <Rating rating={movie.rating} editable={false} />
                  </div>
                )}
                {movie.notes && (
                  <div className="notes-display">
                    <p className="notes-label">Your Thoughts:</p>
                    <p className="notes-text">{movie.notes}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="card-actions">
              {!isFavorite ? (
                <button onClick={handleSaveToFavorites} className="btn btn-primary btn-full">
                  Save to Favorites
                </button>
              ) : (
                <>
                  <button onClick={() => setIsUpdating(true)} className="btn btn-primary">
                    Edit Rating & Notes
                  </button>
                  <button onClick={handleDelete} className="btn btn-danger">
                    Delete
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
