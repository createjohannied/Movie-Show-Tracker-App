import React from "react";
import "./FilterBar.css";

function FilterBar({ filters, onFilterChange }) {
  const { type, year } = filters;

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="type-filter">Filter by Type:</label>
        <select
          id="type-filter"
          value={type || "all"}
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value === "all" ? null : e.target.value })}
          className="filter-select"
        >
          <option value="all">All Types</option>
          <option value="movie">Movies</option>
          <option value="series">TV Series</option>
          <option value="episode">Episodes</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="year-filter">Filter by Year:</label>
        <input
          id="year-filter"
          type="text"
          placeholder="Year (e.g., 2020)"
          value={year || ""}
          onChange={(e) => {
            const value = e.target.value.trim();
            onFilterChange({ ...filters, year: value === "" ? null : value });
          }}
          className="filter-input"
        />
      </div>

      {(type !== null || year !== null) && (
        <button
          onClick={() => onFilterChange({ type: null, year: null })}
          className="clear-filters-btn"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default FilterBar;

