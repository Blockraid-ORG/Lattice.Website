import { RPCProviderService } from "@/services/rpc-provider.service";
import { toast } from "sonner";

/**
 * App Initialization Service
 * Menginisialisasi RPC Provider Service di awal aplikasi
 */
export class AppInitService {
  private static isInitialized = false;

  /**
   * Initialize semua service yang diperlukan
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("⚡ App services already initialized");
      return;
    }

    try {
      console.log("🚀 Initializing app services...");

      // Initialize RPC Provider Service
      await RPCProviderService.initialize();

      this.isInitialized = true;
      console.log("✅ All app services initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize app services:", error);
      toast.error("Failed to initialize app services");
      throw error;
    }
  }

  /**
   * Check if services are initialized
   */
  static isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Reset initialization (untuk testing)
   */
  static reset(): void {
    this.isInitialized = false;
    RPCProviderService.clearCache();
  }
}
