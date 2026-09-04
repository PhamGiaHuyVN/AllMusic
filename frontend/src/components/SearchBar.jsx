import React from 'react';

function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="🔍 Tìm kiếm bài hát hoặc nghệ sĩ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default SearchBar;