'use client';

import React, { createContext, useContext, useState, useEffect } from "react";

interface DarkModeContextValue {
  dark: boolean;
  toggle: () => void;
}

const DarkModeContext = createContext<DarkModeContextValue>({ dark: false, toggle: () => {} });

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("andwell-dark");
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try { localStorage.setItem("andwell-dark", String(dark)); } catch {}
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggle = () => setDark((prev) => !prev);

  return (
    <DarkModeContext.Provider value={{ dark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  return useContext(DarkModeContext);
}
