function SearchBar({ search, setSearch }) {
  return (
    <input
      type="text"
      placeholder="Search cases..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="
        w-full
        rounded-xl
        border
        border-gray-300
        bg-white
        px-5
        py-3
        outline-none
        focus:border-black
      "
    />
  );
}

export default SearchBar;