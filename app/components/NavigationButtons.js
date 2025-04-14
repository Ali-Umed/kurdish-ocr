"use client";

export default function NavigationButtons({
  currentPage,
  pdfDocument,
  goToPreviousPage,
  goToNextPage,
  loading,
}) {
  return (
    <div className="mt-5 flex justify-between">
      <button
        onClick={goToPreviousPage}
        disabled={currentPage <= 1 || loading}
        className="font-bold py-2 px-4 rounded disabled:opacity-50 focus:outline-none focus:shadow-outline bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white transition-colors duration-300"
      >
        Previous
      </button>
      <p className="text-gray-900 dark:text-gray-100 transition-colors duration-300">
        Page {currentPage} / {pdfDocument?.numPages || 0}
      </p>
      <button
        onClick={goToNextPage}
        disabled={
          !pdfDocument || currentPage >= pdfDocument.numPages || loading
        }
        className="font-bold py-2 px-4 rounded disabled:opacity-50 focus:outline-none focus:shadow-outline bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white transition-colors duration-300"
      >
        Next
      </button>
    </div>
  );
}
