"use client";

import { useState, useEffect } from "react";

export default function FeatureStatus() {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-yellow-500 text-yellow-700 mt-4 mb-4 px-4 py-3 rounded relative transition-opacity duration-500 ease-in-out">
      <strong className="font-bold">Under Development!</strong>
      <span className="block sm:inline">
        {" "}
        Some features are currently under development and will be available soon
        and work better.
      </span>
      <span className="block sm:inline">
        {" "}
        هەندێک تایبەتمەندی لەژێر پەرەپێدان دان و بەم زووانە بەردەست دەبن و باشتر
        کاردەکات.
      </span>
    </div>
  );
}
