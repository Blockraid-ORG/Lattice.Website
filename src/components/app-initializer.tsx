"use client";

import { useEffect } from "react";
import { AppInitService } from "@/services/app-init.service";

/**
 * App Initializer Component
 * Menginisialisasi semua service yang diperlukan di awal aplikasi
 */
export function AppInitializer() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🚀 Starting app initialization...");
        await AppInitService.initialize();
        console.log("✅ App initialization completed");
      } catch (error) {
        console.error("❌ App initialization failed:", error);
      }
    };

    initializeApp();
  }, []);

  return null; // This component doesn't render anything
}
