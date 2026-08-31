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
      className="whitespace-nowrap rounded-full bg-flame-gradient px-3 py-1.5 text-[10px] font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.03] focus-visible:scale-[1.03]"
      aria-label="Toggle previous theme"
    >
      {isOld ? "Light Mode" : "Dark Mode"}
    </button>
  );
}


