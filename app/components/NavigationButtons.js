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
        className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-300"
      >
        Previous
      </button>
      <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
        Page {currentPage} / {pdfDocument?.numPages || 0}
      </p>
      <button
        onClick={goToNextPage}
        disabled={
          !pdfDocument || currentPage >= pdfDocument.numPages || loading
        }
        className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-300"
      >
        Next
      </button>
    </div>
  );
}
