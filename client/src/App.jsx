import { useState } from "react";
import SearchForm from "./components/SearchForm";
import MediaList from "./components/MediaList";

function App() {
  const [movies, setMovies] = useState([]);

  return (
    <div className="App">
      <h1>Movie/Show Tracker</h1>
      <SearchForm setMovies={setMovies} />
      <MediaList movies={movies} />
    </div>
  );
}

export default App;
