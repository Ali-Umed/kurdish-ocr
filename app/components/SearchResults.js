"use client";

export default function SearchResults({ searchResults, pageTexts }) {
  return (
    <>
      {searchResults.length > 0 && (
        <div className="mt-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
            Search Results
          </h3>
          {searchResults.map((result) => (
            <div
              key={`${result.page}-${result.matches[0].index}`}
              className="mt-2 border border-gray-200 rounded-md p-4 transition-colors duration-300 dark:border-gray-700"
            >
              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                Page {result.page}
              </h4>
              <ul>
                {result.matches.map((match) => (
                  <li key={match.index}>
                    {pageTexts[result.page]?.substring(0, match.index)}
                    <span className="bg-yellow-100 text-gray-900 dark:bg-yellow-400 dark:text-gray-900 transition-colors duration-300 rounded-md px-1">
                      {match.text}
                    </span>
                    {pageTexts[result.page]?.substring(
                      match.index + match.text.length
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
