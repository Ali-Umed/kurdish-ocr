"use client";

export default function PdfUploader({ onFileChange }) {
  return (
    <div className="mt-5">
      <input
        type="file"
        id="pdfUpload"
        accept=".pdf"
        onChange={onFileChange}
        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md transition-colors duration-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
    </div>
  );
}
