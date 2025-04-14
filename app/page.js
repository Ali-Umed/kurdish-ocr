"use client";
import { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { recognize } from "tesseract.js";
import DarkModeToggle from "./components/DarkModeToggle";
import PdfUploader from "./components/PdfUploader";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import PageDisplay from "./components/PageDisplay";
import NavigationButtons from "./components/NavigationButtons";
import ImageUploader from "./components/ImageUploader";
import FeatureStatus from "./components/FeatureStatus";

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
  const [darkMode, setDarkMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(storedDarkMode);
    if (storedDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

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

  const handleImageChange = async (e) => {
    setLoading(true);
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
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
        setPageTexts({ image: text });
      } catch (error) {
        console.error("Error during OCR:", error);
        setPageTexts({ image: "❌ Error during OCR. Check console." });
      } finally {
        setLoading(false);
        setProgress(0);
        setPdfDocument(null);
        setCurrentPage(1);
      }
    };

    img.src = URL.createObjectURL(file);
  };

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

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <FeatureStatus />
      <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="max-w-3xl mx-auto shadow-lg rounded-md overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
            Kurdish Sorani PDF OCR
          </h2>
          <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-300 transition-colors duration-300">
            <p>Upload a PDF file or an image to extract Kurdish Sorani text.</p>
          </div>
          <PdfUploader onFileChange={handleFileChange} />
          <ImageUploader onImageChange={handleImageChange} />
          {loading && (
            <>
              <p className="mt-3 text-blue-600 dark:text-blue-400 transition-colors duration-300">
                ⏳ Processing page {currentPage}...
              </p>
              <progress value={progress} max="100" className="w-full" />
            </>
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          <SearchBar searchTerm={searchTerm} handleSearch={handleSearch} />

          <SearchResults searchResults={searchResults} pageTexts={pageTexts} />

          {Object.entries(pageTexts).map(([page, text]) => (
            <PageDisplay
              key={page}
              page={page}
              text={text}
              collapsedPages={collapsedPages}
              toggleCollapse={toggleCollapse}
              handleTextChange={handleTextChange}
            />
          ))}

          <NavigationButtons
            currentPage={currentPage}
            pdfDocument={pdfDocument}
            goToPreviousPage={goToPreviousPage}
            goToNextPage={goToNextPage}
            loading={loading}
          />
          <button
            onClick={downloadOcrResult}
            className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
          >
            Download OCR Result as .txt
          </button>
        </div>
      </div>
    </div>
  );
}
