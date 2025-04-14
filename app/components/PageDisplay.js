"use client";

import { useState, useRef, useEffect } from "react";

export default function PageDisplay({
  page,
  text,
  collapsedPages,
  toggleCollapse,
  handleTextChange,
}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const textareaRef = useRef(null);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(2, scale + delta));
    setScale(newScale);

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setPosition((prev) => ({
      x: prev.x - x * e.deltaY,
      y: prev.y - y * e.deltaY,
    }));
  };

  const handleMouseDown = (e) => {
    if (!textareaRef.current) return;

    let startX = e.pageX - position.x;
    let startY = e.pageY - position.y;

    const handleMouseMove = (e) => {
      setPosition({
        x: e.pageX - startX,
        y: e.pageY - startY,
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.transformOrigin = "0 0";
    textarea.style.transform = `scale(${scale}) translate(${position.x}px, ${position.y}px)`;
  }, [scale, position]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  const handleDownloadText = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `page_${page}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      key={page}
      className="mt-5 border border-gray-200 rounded-md p-4 transition-colors duration-300 dark:border-gray-700"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
          Page {page}
        </h3>
        <div>
          <button
            onClick={handleCopyToClipboard}
            className="text-sm text-gray-600 hover:text-blue-500 focus:outline-none transition-colors duration-300 mr-2"
          >
            Copy
          </button>
          <button
            onClick={handleDownloadText}
            className="text-sm text-gray-600 hover:text-blue-500 focus:outline-none transition-colors duration-300 mr-2"
          >
            Download
          </button>
          <button
            onClick={() => toggleCollapse(page)}
            className="text-sm text-gray-600 hover:text-blue-500 focus:outline-none transition-colors duration-300"
          >
            {collapsedPages[page] ? "Expand" : "Collapse"}
          </button>
        </div>
      </div>
      {!collapsedPages[page] && (
        <div
          ref={containerRef}
          className="overflow-hidden relative"
          style={{ height: "400px" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleTextChange(page, e.target.value)}
            rows="5"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md transition-colors duration-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white absolute top-0 left-0 resize-none"
            style={{
              transformOrigin: "0 0",
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      )}
    </div>
  );
}
