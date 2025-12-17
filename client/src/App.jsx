import { useState, useEffect, useMemo } from "react";
import SearchForm from "./components/SearchForm";
import MediaList from "./components/MediaList";

function App() {
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [filters, setFilters] = useState({ type: null, year: null });

  const fetchWatchlist = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched watchlist:", data);
        setWatchlist(data);
      } else {
        console.error("Failed to fetch watchlist");
      }
    } catch (err) {
      console.error("Error fetching watchlist:", err);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Filter watchlist based on current filters
  const filteredWatchlist = useMemo(() => {
    return watchlist.filter((item) => {
      // Filter by type
      if (filters.type !== null) {
        if (!item.type || item.type.toLowerCase() !== filters.type.toLowerCase()) {
          return false;
        }
      }

      // Filter by year
      if (filters.year !== null && filters.year !== "") {
        const itemYear = item.year ? item.year.toString() : "";
        if (!itemYear.includes(filters.year)) {
          return false;
        }
      }

      return true;
    });
  }, [watchlist, filters]);

  return (
    <div className="App">
      <div className="app-header">
        <h1>🎬 Movie & Show Tracker</h1>
        <p>Discover and track movies and shows you want to watch</p>
      </div>
      <div className="app-content">
        <SearchForm setMovies={setMovies} />
        <MediaList 
          movies={movies} 
          onWatchlistUpdate={fetchWatchlist}
        />
        <MediaList 
          movies={filteredWatchlist} 
          isWatchlist={true} 
          onWatchlistUpdate={fetchWatchlist} 
          onWatchlistDelete={fetchWatchlist} 
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>
    </div>
  );
}

export default App;
