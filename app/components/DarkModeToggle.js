"use client";

import { FaMoon, FaSun } from "react-icons/fa";

export default function DarkModeToggle({ darkMode, toggleDarkMode }) {
  return (
    <button
      onClick={toggleDarkMode}
      className="absolute top-4 right-4 rounded-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {darkMode ? (
        <FaSun className="text-gray-700 dark:text-yellow-400 text-xl" />
      ) : (
        <FaMoon className="text-gray-700 dark:text-gray-300 text-xl" />
      )}
    </button>
  );
}
