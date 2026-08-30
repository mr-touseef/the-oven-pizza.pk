"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isOld, setIsOld] = useState(false);

  useEffect(() => {
    setIsOld(document.documentElement.classList.contains("theme-old"));
  }, []);

  const toggle = () => {
    const next = !isOld;
    setIsOld(next);
    if (next) {
      document.documentElement.classList.add("theme-old");
      localStorage.setItem("oven-theme", "old");
    } else {
      document.documentElement.classList.remove("theme-old");
      localStorage.setItem("oven-theme", "new");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="whitespace-nowrap rounded-full border border-oven-cream/50 bg-oven-cream/10 px-2 py-0.5 text-[10px] font-semibold text-oven-cream transition-colors hover:bg-oven-cream/20 hover:border-oven-flame-light hover:text-oven-flame-light"
      aria-label="Toggle previous theme"
    >
      {isOld ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

