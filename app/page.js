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
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pageTexts, setPageTexts] = useState({});
  const [collapsedPages, setCollapsedPages] = useState({});
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

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
      setPageTexts({});
      setCollapsedPages({});
      setProgress(0);
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
          logger: (m) => {
            console.log(m);
            if (m.status === "recognizing text") {
              setProgress(m.progress * 100);
            }
          },
        });

        let text = result.data.text.trim();
        text = fixKurdishText(text);
        setPageTexts((prev) => ({ ...prev, [currentPage]: text }));
      } catch (error) {
        console.error("Error during OCR:", error);
        setPageTexts((prev) => ({
          ...prev,
          [currentPage]: "❌ Error during OCR. Check console.",
        }));
      } finally {
        setLoading(false);
        setProgress(0);
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

  const handleTextChange = (page, text) => {
    setPageTexts((prev) => ({ ...prev, [page]: text }));
  };

  const toggleCollapse = (page) => {
    setCollapsedPages((prev) => ({ ...prev, [page]: !prev[page] }));
  };

  const downloadOcrResult = () => {
    let allText = "";
    for (const page in pageTexts) {
      allText += `Page ${page}:\n${pageTexts[page]}\n\n`;
    }

    const blob = new Blob([allText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ocr_result.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term) {
      const results = Object.entries(pageTexts).reduce((acc, [page, text]) => {
        const cleanedText = text
          ? text.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
          : "";
        const regex = new RegExp(term, "gi");
        const matches = [...(text?.matchAll(regex) || [])];

        if (matches.length) {
          acc.push({
            page,
            matches: matches.map((match) => ({
              index: match.index,
              text: match[0],
            })),
          });
        }
        return acc;
      }, []);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-800 text-white">
      <div className="max-w-3xl mx-auto shadow-lg rounded-lg overflow-hidden bg-gray-900">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-100">
            Kurdish Sorani PDF OCR
          </h2>
          <div className="mt-2 max-w-xl text-sm text-gray-300">
            <p>Upload a PDF file to extract Kurdish Sorani text.</p>
          </div>
          <div className="mt-5">
            <input
              type="file"
              id="pdfUpload"
              accept=".pdf"
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          {loading && (
            <>
              <p className="mt-3 text-blue-400">
                ⏳ Processing page {currentPage}...
              </p>
              <progress value={progress} max="100" />
            </>
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className="mt-5">
            <input
              type="text"
              placeholder="Search inside extracted text..."
              value={searchTerm}
              onChange={handleSearch}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="mt-5">
              <h3 className="text-lg font-medium text-gray-100">
                Search Results
              </h3>
              {searchResults.map((result) => (
                <div
                  key={`${result.page}-${result.matches[0].index}`}
                  className="mt-2 border border-gray-600 rounded p-4"
                >
                  <h4 className="text-md font-semibold text-gray-100">
                    Page {result.page}
                  </h4>
                  <ul>
                    {result.matches.map((match) => (
                      <li key={match.index}>
                        {pageTexts[result.page]?.substring(0, match.index)}
                        <span className="bg-yellow-500 text-gray-900">
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

          {Object.entries(pageTexts).map(([page, text]) => (
            <div key={page} className="mt-5 border border-gray-600 rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-100">Page {page}</h3>
                <button
                  onClick={() => toggleCollapse(page)}
                  className="text-sm text-gray-400 hover:text-gray-300 focus:outline-none"
                >
                  {collapsedPages[page] ? "Expand" : "Collapse"}
                </button>
              </div>
              {!collapsedPages[page] && (
                <textarea
                  value={text}
                  onChange={(e) => handleTextChange(page, e.target.value)}
                  rows="5"
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline"
                />
              )}
            </div>
          ))}

          <div className="mt-5 flex justify-between">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage <= 1 || loading}
              className="font-bold py-2 px-4 rounded disabled:opacity-50 focus:outline-none focus:shadow-outline bg-gray-600 hover:bg-gray-500 text-white"
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
              className="font-bold py-2 px-4 rounded disabled:opacity-50 focus:outline-none focus:shadow-outline bg-gray-600 hover:bg-gray-500 text-white"
            >
              Next
            </button>
          </div>
          <button
            onClick={downloadOcrResult}
            className="mt-5 bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Download OCR Result as .txt
          </button>
        </div>
      </div>
    </div>
  );
}
