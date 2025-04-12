"use client";
import { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { recognize } from "tesseract.js";
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
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

  return (
    <div className="p-4">
      <input type="file" id="pdfUpload" accept=".pdf" className="mb-4" />
      {loading && (
        <p className="text-blue-500">⏳ Processing page {currentPage}...</p>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div
        id="output"
        dangerouslySetInnerHTML={{ __html: output }}
        className="space-y-4 mt-4"
      />
      <div className="flex justify-between mt-4">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage <= 1 || loading}
          className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <p>
          Page {currentPage} / {pdfDocument?.numPages || 0}
        </p>
        <button
          onClick={goToNextPage}
          disabled={
            !pdfDocument || currentPage >= pdfDocument.numPages || loading
          }
          className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
