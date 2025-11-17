"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface HapticsContextValue {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

const HapticsContext = createContext<HapticsContextValue | undefined>(
  undefined,
);

export function HapticsProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    // Read initial value from localStorage on mount
    try {
      const raw = localStorage.getItem("hapticsEnabled");
      if (raw === null) {
        localStorage.setItem("hapticsEnabled", "true");
        setEnabled(true);
      } else {
        setEnabled(raw === "true");
      }
    } catch (e) {
      // localStorage not available; keep default true
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("hapticsEnabled", enabled ? "true" : "false");
    } catch (e) {
      // ignore
    }
  }, [enabled]);

  return (
    <HapticsContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </HapticsContext.Provider>
  );
}

export function useHaptics() {
  const ctx = useContext(HapticsContext);
  if (!ctx) {
    throw new Error("useHaptics must be used within HapticsProvider");
  }
  return ctx;
}

export default HapticsProvider;
