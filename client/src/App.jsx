import { useState, useEffect } from "react";
import SearchForm from "./components/SearchForm";
import MediaList from "./components/MediaList";
import { API_BASE_URL } from "./config";

function App() {
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [filters, setFilters] = useState({ type: null, year: null });

  const fetchWatchlist = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/watchlist`);
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data);
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const filteredWatchlist = watchlist.filter((item) => {
    if (filters.type !== null && item.type && item.type.toLowerCase() !== filters.type.toLowerCase()) {
      return false;
    }
    if (filters.year !== null && filters.year !== "" && item.year && !item.year.toString().includes(filters.year)) {
      return false;
    }
    return true;
  });

  return (
    <div className="App">
      <div className="app-header">
        <h1>Movie & Show Tracker</h1>
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
