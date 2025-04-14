"use client";

export default function SearchResults({ searchResults, pageTexts }) {
  return (
    <>
      {searchResults.length > 0 && (
        <div className="mt-5">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
            Search Results
          </h3>
          {searchResults.map((result) => (
            <div
              key={`${result.page}-${result.matches[0].index}`}
              className="mt-2 border border-gray-300 rounded p-4 dark:border-gray-500 transition-colors duration-300"
            >
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                Page {result.page}
              </h4>
              <ul>
                {result.matches.map((match) => (
                  <li key={match.index}>
                    {pageTexts[result.page]?.substring(0, match.index)}
                    <span className="bg-yellow-200 text-gray-900 dark:bg-yellow-500 dark:text-white transition-colors duration-300">
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
