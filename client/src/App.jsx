import { useState, useEffect } from "react";
import SearchForm from "./components/SearchForm";
import MediaList from "./components/MediaList";

function App() {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/favorites");
      if (res.ok) {
        const data = await res.json();
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
          movies={favorites} 
          isFavorite={true} 
          onFavoriteUpdate={fetchFavorites} 
          onFavoriteDelete={fetchFavorites} 
        />
      </div>
    </div>
  );
}

export default App;
