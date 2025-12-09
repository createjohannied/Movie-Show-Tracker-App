import React from "react";
import MediaCard from "./MediaCard";
import FilterBar from "./FilterBar";
import "./MediaList.css";

function MediaList({ movies, isFavorite = false, onFavoriteUpdate, onFavoriteDelete, filters, onFilterChange }) {
  const title = isFavorite ? "My Favorites" : "Search Results";

  return (
    <div className={`media-list ${isFavorite ? "favorites-list" : ""}`}>
      <div className="list-header">
        <h2 className="list-title">{title}</h2>
        {movies.length > 0 && (
          <span className="list-count">{movies.length} {movies.length === 1 ? "item" : "items"}</span>
        )}
      </div>
      
      {isFavorite && filters && onFilterChange && (
        <FilterBar filters={filters} onFilterChange={onFilterChange} />
      )}
      
      {movies.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">
            {isFavorite 
              ? (filters && (filters.type !== null || filters.year !== null)
                  ? "No favorites match your filters. Try adjusting your filter criteria!"
                  : "No favorites yet. Save some movies or shows to get started!")
              : "No results yet. Search for a movie or show!"}
          </p>
        </div>
      ) : (
        <div className="media-grid">
          {movies.map((movie, index) => (
            <MediaCard 
              key={isFavorite ? movie.id : index} 
              movie={movie} 
              isFavorite={isFavorite}
              onFavoriteUpdate={onFavoriteUpdate}
              onFavoriteDelete={onFavoriteDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaList;
