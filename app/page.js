"use client";
import { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { recognize } from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;

const fixKurdishText = (text) => {
  text = text
    .replace(/(?<=\s|^)(ب)(?=\s|$)/g, "پ")
    .replace(/(?<=[ەوڕکگچجپڵڤەیئ ])و(?=[ەوڕکگچجپڵڤەیئ ])/g, "ۆ")
    .replace(/ى/g, "ێ")
    .replace(
      /(?<=[بپتجچخدذرزسشعغفڤقکگلڵمنهەؤءئ])ی(?=[\s.,؛،!؟\u200c]|$)/g,
      "ێ"
    );
  return text;
};

export default function PdfOcr() {
  const canvasRef = useRef(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [extractedText, setExtractedText] = useState("");

  useEffect(() => {
    const handleFileChange = async (e) => {
      setLoading(true);
      const file = e.target.files[0];
      if (!file) return;

      const pdfData = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      setPdfDocument(pdf);
      setCurrentPage(1);
      setLoading(false);
      setExtractedText("");
      setOutput("");
    };

    const input = document.getElementById("pdfUpload");
    if (input) input?.addEventListener("change", handleFileChange);
    return () => input?.removeEventListener("change", handleFileChange);
  }, []);

  useEffect(() => {
    const extractTextFromPage = async () => {
      if (!pdfDocument) return;

      setLoading(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      try {
        const page = await pdfDocument.getPage(currentPage);
        const viewport = page.getViewport({ scale: 2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;

        const result = await recognize(canvas, "fas", {
          logger: (m) => console.log(m),
        });

        let text = result.data.text.trim();
        text = fixKurdishText(text);
        setOutput(
          `<h3>📄 Page ${currentPage}</h3><pre dir="rtl">${text}</pre>`
        );
        setExtractedText(text);
      } catch (error) {
        console.error("Error during OCR:", error);
        setOutput("❌ Error during OCR. Check console.");
      } finally {
        setLoading(false);
      }
    };

    extractTextFromPage();
  }, [currentPage, pdfDocument]);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const goToNextPage = () => {
    if (pdfDocument && currentPage < pdfDocument.numPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleTextChange = (e) => {
    setExtractedText(e.target.value);
  };

  return (
    <div className="container  mx-auto p-4 bg-gray-800 text-white">
      <div className="max-w-3xl mx-auto  shadow-lg rounded-lg overflow-hidden bg-gray-900">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium   text-gray-100">
            Kurdish Sorani PDF OCR
          </h2>
          <div className="mt-2 max-w-xl text-sm   text-gray-300">
            <p>Upload a PDF file to extract Kurdish Sorani text.</p>
          </div>
          <div className="mt-5">
            <input
              type="file"
              id="pdfUpload"
              accept=".pdf"
              className="shadow appearance-none border rounded w-full py-2 px-3   bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          {loading && (
            <p className="  mt-3 text-blue-400">
              ⏳ Processing page {currentPage}...
            </p>
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div className="mt-5">
            <div
              className="text-xl font-bold mb-2"
              dangerouslySetInnerHTML={{ __html: output }}
            />
            <textarea
              value={extractedText}
              onChange={handleTextChange}
              rows="10"
              className="shadow appearance-none border rounded w-full py-2 px-3  bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mt-5 flex justify-between">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage <= 1 || loading}
              className="   font-bold py-2 px-4 rounded disabled:opacity-50 focus:outline-none focus:shadow-outline bg-gray-600 hover:bg-gray-500 text-white"
            >
              Previous
            </button>
            <p className="text-white">
              Page {currentPage} / {pdfDocument?.numPages || 0}
            </p>
            <button
              onClick={goToNextPage}
              disabled={
                !pdfDocument || currentPage >= pdfDocument.numPages || loading
              }
              className="   font-bold py-2 px-4 rounded disabled:opacity-50 focus:outline-none focus:shadow-outline bg-gray-600 hover:bg-gray-500 text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
