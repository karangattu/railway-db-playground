"use client";

import { Zap } from "lucide-react";
import { useHaptics } from "./HapticsProvider";

export default function HapticsToggle() {
  const { enabled, setEnabled } = useHaptics();
  const supportsVibrate = typeof navigator !== 'undefined' && (navigator as any).vibrate;

  return (
    <button
      title={
        supportsVibrate
          ? enabled
            ? "Disable haptics" + " — (If this doesn't work, check Android Chrome settings and battery saver.)"
            : "Enable haptics"
          : "Haptics not available on this device/browser"
      }
      aria-pressed={enabled}
      onClick={() => supportsVibrate && setEnabled(!enabled)}
      disabled={!supportsVibrate}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
        supportsVibrate
          ? enabled
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          : "bg-gray-100 text-gray-400 cursor-not-allowed"
      }`}
    >
      <Zap size={16} />
      <span className="hidden md:inline">Haptics</span>
    </button>
  );
}
