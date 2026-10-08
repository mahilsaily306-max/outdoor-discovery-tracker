"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("VERDA Service Worker registered:", reg.scope))
        .catch((err) => console.warn("VERDA Service Worker registration failed:", err));
    }
  }, []);

  return null;
}
