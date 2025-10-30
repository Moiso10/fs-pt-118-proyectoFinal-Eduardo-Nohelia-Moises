// src/front/components/Filters.jsx
export const Filters = ({ genres, selectedGenre, onGenreChange }) => (
  <div className="genre-select-container">
    <label className="genre-label">Filtrar por género:</label>
    <select
      className="genre-select"
      value={selectedGenre}
      onChange={(e) => onGenreChange(e.target.value)}
    >
      <option value="">Todos</option>
      {genres.map((genre) => (
        <option key={genre.id} value={genre.id}>
          {genre.name}
        </option>
      ))}
    </select>
  </div>
);
