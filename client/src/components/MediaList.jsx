import React from "react";
import MediaCard from "./MediaCard";
import FilterBar from "./FilterBar";
import "./MediaList.css";

function MediaList({ movies, isWatchlist = false, onWatchlistUpdate, onWatchlistDelete, filters, onFilterChange }) {
  const title = isWatchlist ? "My Watchlist" : "Search Results";

  return (
    <div className={`media-list ${isWatchlist ? "watchlist-list" : ""}`}>
      <div className="list-header">
        <h2 className="list-title">{title}</h2>
        {movies.length > 0 && (
          <span className="list-count">{movies.length} {movies.length === 1 ? "item" : "items"}</span>
        )}
      </div>
      
      {isWatchlist && filters && onFilterChange && (
        <FilterBar filters={filters} onFilterChange={onFilterChange} />
      )}
      
      {movies.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">
            {isWatchlist 
              ? (filters && (filters.type !== null || filters.year !== null)
                  ? "No watchlist items match your filters. Try adjusting your filter criteria!"
                  : "Your watchlist is empty. Add some movies or shows to get started!")
              : "No results yet. Search for a movie or show!"}
          </p>
        </div>
      ) : (
        <div className="media-grid">
          {movies.map((movie, index) => (
            <MediaCard 
              key={isWatchlist ? movie.id : index} 
              movie={movie} 
              isWatchlist={isWatchlist}
              onWatchlistUpdate={onWatchlistUpdate}
              onWatchlistDelete={onWatchlistDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaList;
