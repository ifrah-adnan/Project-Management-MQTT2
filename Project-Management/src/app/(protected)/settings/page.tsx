"use client";
import * as React from "react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useFontSize } from "@/context/TableFontSize";

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
  };

  const handleThemeChange = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(parseInt(e.target.value));
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
        <div className="bg-gray-200 px-6 py-4 dark:bg-gray-700">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Settings
          </h1>
        </div>
        <form className="space-y-6 px-6 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Langue
            </label>
            <select
              onChange={handleLanguageChange}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="en">Anglais</option>
              <option value="fr">Français</option>
              <option value="es">Espagnol</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Thème
            </label>
            <select
              value={theme}
              onChange={handleThemeChange}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Taille du Texte
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={handleFontSizeChange}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
              />
              <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                {fontSize} px
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
