"use client";
import { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { recognize } from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;

export default function PdfOcr() {
  const canvasRef = useRef(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleFileChange = async (e) => {
      setLoading(true);
      const file = e.target.files[0];
      if (!file) return;

      const pdfData = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;

        const result = await recognize(canvas, "fas", {
          logger: (m) => console.log(m),
        });

        let text = result.data.text.trim();

        // Fix Sorani letters
        text = text
          .replace(/(?<=\s|^)(ب)(?=\s|$)/g, "پ")
          .replace(/(?<=[ەوڕکگچجپڵڤەیئ ])و(?=[ەوڕکگچجپڵڤەیئ ])/g, "ۆ")
          .replace(/ى/g, "ێ")
          .replace(
            /(?<=[بپتجچخدذرزسشعغفڤقکگلڵمنهەؤءئ])ی(?=[\s.,؛،!؟\u200c]|$)/g,
            "ێ"
          );

        fullText += `<h3>📄 Page ${pageNum}</h3><pre dir="rtl">${text}</pre>`;
      }

      setOutput(fullText);
      setLoading(false);
    };

    const input = document.getElementById("pdfUpload");
    if (input) input.addEventListener("change", handleFileChange);
    return () => input?.removeEventListener("change", handleFileChange);
  }, []);

  return (
    <div>
      <input type="file" id="pdfUpload" accept=".pdf" className="mb-4" />
      {loading && <p className="text-blue-500">⏳ Processing...</p>}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div
        id="output"
        dangerouslySetInnerHTML={{ __html: output }}
        className="space-y-4 mt-4"
      />
    </div>
  );
}
