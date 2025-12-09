import React, { useState } from "react";
import "./SearchForm.css";

function SearchForm({ setMovies }) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e?.preventDefault();
    
    if (!query.trim()) {
      setError("Please enter a movie or show title");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`http://localhost:4000/api/search?title=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (res.ok) {
        setMovies([data]);
        setError("");
      } else {
        setError(data.error || "Movie/show not found");
        setMovies([]);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to search. Please try again.");
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="search-form-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search for a movie or TV show..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError("");
            }}
            onKeyPress={handleKeyPress}
            className="search-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <span className="loading-spinner">⏳</span>
            ) : (
              <span>🔍</span>
            )}
            <span className="button-text">Search</span>
          </button>
        </div>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

export default SearchForm;
