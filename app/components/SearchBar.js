"use client";

export default function SearchBar({ searchTerm, handleSearch }) {
  return (
    <div className="mt-5">
      <input
        type="text"
        placeholder="Search inside extracted text..."
        value={searchTerm}
        onChange={handleSearch}
        className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white leading-tight focus:outline-none focus:shadow-outline transition-colors duration-300"
      />
    </div>
  );
}
