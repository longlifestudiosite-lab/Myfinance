"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Register the new SW that cleans up caches and unregisters itself
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        // Force update check
        registration.update();
      });
    }
  }, []);

  return null;
}
