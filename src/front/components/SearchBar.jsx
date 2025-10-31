// src/front/components/SearchBar.jsx
export const SearchBar = ({ query, setQuery, onSearch }) => (
  <form className="search-bar" onSubmit={onSearch}>
    <input
      type="text"
      placeholder="Buscar por título, actor o año..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
    <button type="submit" className="btn-search">🔍</button>
  </form>
);
