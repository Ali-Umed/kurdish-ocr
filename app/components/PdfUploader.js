"use client";

import { useState } from "react";

export default function PdfUploader({ onFileChange }) {
  return (
    <div className="mt-5">
      <input
        type="file"
        id="pdfUpload"
        accept=".pdf"
        onChange={onFileChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white leading-tight focus:outline-none focus:shadow-outline transition-colors duration-300"
      />
    </div>
  );
}
