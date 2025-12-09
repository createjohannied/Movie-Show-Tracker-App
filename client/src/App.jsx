import { useState, useEffect, useMemo } from "react";
import SearchForm from "./components/SearchForm";
import MediaList from "./components/MediaList";

function App() {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({ type: null, year: null });

  const fetchFavorites = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/favorites");
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched favorites:", data);
        setFavorites(data);
      } else {
        console.error("Failed to fetch favorites");
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Filter favorites based on current filters
  const filteredFavorites = useMemo(() => {
    return favorites.filter((favorite) => {
      // Filter by type
      if (filters.type !== null) {
        if (!favorite.type || favorite.type.toLowerCase() !== filters.type.toLowerCase()) {
          return false;
        }
      }

      // Filter by year
      if (filters.year !== null && filters.year !== "") {
        const favoriteYear = favorite.year ? favorite.year.toString() : "";
        if (!favoriteYear.includes(filters.year)) {
          return false;
        }
      }

      return true;
    });
  }, [favorites, filters]);

  return (
    <div className="App">
      <div className="app-header">
        <h1>🎬 Movie & Show Tracker</h1>
        <p>Discover, rate, and save your favorite entertainment</p>
      </div>
      <div className="app-content">
        <SearchForm setMovies={setMovies} />
        <MediaList 
          movies={movies} 
          onFavoriteUpdate={fetchFavorites}
        />
        <MediaList 
          movies={filteredFavorites} 
          isFavorite={true} 
          onFavoriteUpdate={fetchFavorites} 
          onFavoriteDelete={fetchFavorites}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>
    </div>
  );
}

export default App;
