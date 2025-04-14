"use client";

import { FaMoon, FaSun } from "react-icons/fa";

export default function DarkModeToggle({ darkMode, toggleDarkMode }) {
  return (
    <button
      onClick={toggleDarkMode}
      className="absolute top-4 right-4 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
    >
      {darkMode ? (
        <FaSun className="text-gray-800 dark:text-yellow-500" />
      ) : (
        <FaMoon className="text-gray-800 dark:text-gray-200" />
      )}
    </button>
  );
}
