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

  return (
    <div
      key={page}
      className="mt-5 border border-gray-300 rounded p-4 dark:border-gray-500 transition-colors duration-300"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
          Page {page}
        </h3>
        <div>
          <button
            onClick={handleCopyToClipboard}
            className="text-sm text-gray-600 hover:text-gray-500 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-300 mr-2"
          >
            Copy
          </button>
          <button
            onClick={() => toggleCollapse(page)}
            className="text-sm text-gray-600 hover:text-gray-500 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-300"
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
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white leading-tight focus:outline-none focus:shadow-outline transition-colors duration-300 absolute top-0 left-0"
            style={{
              transformOrigin: "0 0",
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              width: "100%",
              height: "100%",
              resize: "none",
            }}
          />
        </div>
      )}
    </div>
  );
}
