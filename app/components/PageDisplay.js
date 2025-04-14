"use client";

export default function PageDisplay({
  page,
  text,
  collapsedPages,
  toggleCollapse,
  handleTextChange,
}) {
  return (
    <div
      key={page}
      className="mt-5 border border-gray-300 rounded p-4 dark:border-gray-500 transition-colors duration-300"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
          Page {page}
        </h3>
        <button
          onClick={() => toggleCollapse(page)}
          className="text-sm text-gray-600 hover:text-gray-500 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-300"
        >
          {collapsedPages[page] ? "Expand" : "Collapse"}
        </button>
      </div>
      {!collapsedPages[page] && (
        <textarea
          value={text}
          onChange={(e) => handleTextChange(page, e.target.value)}
          rows="5"
          className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white leading-tight focus:outline-none focus:shadow-outline transition-colors duration-300"
        />
      )}
    </div>
  );
}
