import React from "react";
import "./Rating.css";

function Rating({ rating = 0, onRatingChange, editable = false }) {
  const handleClick = (value) => {
    if (editable && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="rating-container">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? "filled" : ""} ${editable ? "editable" : ""}`}
          onClick={() => handleClick(star)}
          role={editable ? "button" : undefined}
          tabIndex={editable ? 0 : undefined}
          onKeyDown={(e) => {
            if (editable && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              handleClick(star);
            }
          }}
        >
          ★
        </span>
      ))}
      {rating > 0 && <span className="rating-text">{rating}/5</span>}
    </div>
  );
}

export default Rating;

