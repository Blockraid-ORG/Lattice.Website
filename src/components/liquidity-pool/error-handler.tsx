"use client";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ErrorHandlerProps {
  error: string | Error | null;
  onRetry?: () => void;
  onClose?: () => void;
  title?: string;
  className?: string;
}

interface ErrorInfo {
  title: string;
  description: string;
  type: "error" | "warning" | "info";
  icon: string;
  actionLabel?: string;
  actionUrl?: string;
  suggestions?: string[];
}

export function ErrorHandler({
  error,
  onRetry,
  onClose,
  title = "Error",
  className = "",
}: ErrorHandlerProps) {
  if (!error) return null;

  const errorMessage = typeof error === "string" ? error : error.message;

  // Parse error and provide user-friendly information
  const getErrorInfo = (errorMsg: string): ErrorInfo => {
    const msg = errorMsg.toLowerCase();

    // Pool related errors
    if (msg.includes("pool does not exist") || msg.includes("pool not found")) {
      return {
        title: "Pool Belum Ada",
        description:
          "Liquidity pool untuk pasangan token ini belum dibuat di blockchain.",
        type: "warning",
        icon: "mdi:pool-off",
        suggestions: [
          "Pool akan dibuat otomatis saat Anda menambahkan liquidity pertama kali",
          "Pastikan Anda sudah mengatur starting price yang sesuai",
          "Transaksi pertama akan membutuhkan gas lebih tinggi untuk membuat pool",
        ],
      };
    }

    // Balance & approval errors
    if (
      msg.includes("insufficient") &&
      (msg.includes("balance") || msg.includes("funds"))
    ) {
      return {
        title: "Saldo Tidak Mencukupi",
        description:
          "Saldo token atau native coin Anda tidak mencukupi untuk menyelesaikan transaksi.",
        type: "error",
        icon: "mdi:wallet-outline",
        suggestions: [
          "Pastikan Anda memiliki cukup token untuk liquidity yang ingin ditambahkan",
          "Pastikan Anda memiliki cukup native coin untuk membayar gas fee",
          "Coba kurangi jumlah liquidity yang akan ditambahkan",
        ],
      };
    }

    if (
      msg.includes("allowance") ||
      msg.includes("approval") ||
      msg.includes("approve")
    ) {
      return {
        title: "Token Belum Di-approve",
        description:
          "Token perlu di-approve terlebih dahulu sebelum dapat ditambahkan ke pool.",
        type: "warning",
        icon: "mdi:shield-check",
        suggestions: [
          "Sistem akan secara otomatis meminta approval untuk token",
          "Anda perlu confirm 2 transaksi: approve dan add liquidity",
          "Gunakan infinite approval untuk menghindari approve berulang di masa depan",
        ],
      };
    }

    // Slippage & price errors
    if (
      msg.includes("slippage") ||
      msg.includes("too little received") ||
      msg.includes("price")
    ) {
      return {
        title: "Slippage Tolerance Exceeded",
        description:
          "Harga berubah terlalu banyak selama transaksi berlangsung.",
        type: "warning",
        icon: "mdi:trending-up",
        suggestions: [
          "Coba tingkatkan slippage tolerance di pengaturan",
          "Tunggu beberapa saat agar harga lebih stabil",
          "Kurangi jumlah liquidity untuk mengurangi impact pada harga",
        ],
      };
    }

    // Network & connection errors
    if (
      msg.includes("network") ||
      msg.includes("connection") ||
      msg.includes("timeout")
    ) {
      return {
        title: "Masalah Koneksi",
        description: "Terjadi masalah koneksi dengan blockchain network.",
        type: "error",
        icon: "mdi:wifi-off",
        suggestions: [
          "Periksa koneksi internet Anda",
          "Coba refresh halaman dan ulangi transaksi",
          "Ganti RPC endpoint jika masalah terus berlanjut",
        ],
      };
    }

    // User rejection
    if (
      msg.includes("rejected") ||
      msg.includes("denied") ||
      msg.includes("cancelled")
    ) {
      return {
        title: "Transaksi Dibatalkan",
        description: "Transaksi dibatalkan oleh user di wallet.",
        type: "info",
        icon: "mdi:cancel",
        suggestions: [
          "Coba lagi dan confirm transaksi di wallet Anda",
          "Pastikan Anda memiliki cukup gas fee untuk transaksi",
        ],
      };
    }

    // Gas related errors
    if (msg.includes("gas") || msg.includes("fee")) {
      return {
        title: "Masalah Gas Fee",
        description: "Terjadi masalah dengan estimasi atau pembayaran gas fee.",
        type: "error",
        icon: "mdi:fuel",
        suggestions: [
          "Pastikan Anda memiliki cukup native coin untuk gas fee",
          "Coba tingkatkan gas price jika network sedang ramai",
          "Tunggu beberapa saat agar gas price turun",
        ],
      };
    }

    // Wallet connection errors
    if (msg.includes("wallet") || msg.includes("connect")) {
      return {
        title: "Masalah Wallet",
        description: "Terjadi masalah dengan koneksi atau konfigurasi wallet.",
        type: "error",
        icon: "mdi:wallet-outline",
        suggestions: [
          "Periksa apakah wallet sudah terhubung dengan benar",
          "Pastikan Anda sudah pilih network yang tepat di wallet",
          "Coba disconnect dan connect ulang wallet",
        ],
      };
    }

    // Chain/network mismatch
    if (msg.includes("chain") || msg.includes("network")) {
      return {
        title: "Network Tidak Sesuai",
        description:
          "Network di wallet tidak sesuai dengan yang dipilih di aplikasi.",
        type: "warning",
        icon: "mdi:swap-horizontal",
        suggestions: [
          "Ganti network di wallet sesuai dengan yang dipilih di aplikasi",
          "Atau pilih network yang sesuai dengan wallet Anda",
        ],
      };
    }

    // Generic/unknown errors
    return {
      title: "Terjadi Kesalahan",
      description: "Terjadi kesalahan yang tidak dikenali sistem.",
      type: "error",
      icon: "mdi:alert-circle",
      suggestions: [
        "Coba refresh halaman dan ulangi proses",
        "Periksa koneksi internet dan wallet Anda",
        "Hubungi support jika masalah terus berlanjut",
      ],
    };
  };

  const errorInfo = getErrorInfo(errorMessage);

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "warning":
        return "default";
      case "info":
        return "default";
      default:
        return "destructive";
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "warning":
        return "secondary";
      case "info":
        return "outline";
      default:
        return "destructive";
    }
  };

  return (
    <div className={className}>
      <Alert variant={getAlertVariant(errorInfo.type)} className="relative">
        <Icon name={errorInfo.icon} className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          <span>{errorInfo.title}</span>
          <div className="flex items-center gap-2">
            <Badge
              variant={getBadgeVariant(errorInfo.type)}
              className="text-xs"
            >
              {errorInfo.type.toUpperCase()}
            </Badge>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <Icon name="mdi:close" className="h-4 w-4" />
              </Button>
            )}
          </div>
        </AlertTitle>
        <AlertDescription>
          <div className="space-y-3">
            <p>{errorInfo.description}</p>

            {errorInfo.suggestions && errorInfo.suggestions.length > 0 && (
              <div>
                <p className="font-medium text-sm mb-2">
                  Solusi yang bisa dicoba:
                </p>
                <ul className="space-y-1">
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <Icon
                        name="mdi:arrow-right"
                        className="h-3 w-3 mt-0.5 flex-shrink-0"
                      />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technical Error Details - Collapsible */}
            <details className="group">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                <Icon
                  name="mdi:chevron-right"
                  className="h-3 w-3 inline-block transition-transform group-open:rotate-90"
                />
                Lihat detail error teknis
              </summary>
              <div className="mt-2 p-2 bg-muted/30 rounded text-xs font-mono text-muted-foreground break-all">
                {errorMessage}
              </div>
            </details>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  <Icon name="mdi:refresh" className="h-4 w-4 mr-2" />
                  Coba Lagi
                </Button>
              )}

              {errorInfo.actionUrl && errorInfo.actionLabel && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(errorInfo.actionUrl, "_blank")}
                >
                  <Icon name="mdi:open-in-new" className="h-4 w-4 mr-2" />
                  {errorInfo.actionLabel}
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(errorMessage);
                  // Could add toast notification here
                }}
              >
                <Icon name="mdi:content-copy" className="h-4 w-4 mr-2" />
                Copy Error
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Helper component untuk inline error states
interface InlineErrorProps {
  error: string | Error | null;
  size?: "sm" | "md";
  showIcon?: boolean;
  onRetry?: () => void;
}

export function InlineError({
  error,
  size = "md",
  showIcon = true,
  onRetry,
}: InlineErrorProps) {
  if (!error) return null;

  const errorMessage = typeof error === "string" ? error : error.message;

  return (
    <div
      className={`flex items-center gap-2 text-red-600 ${
        size === "sm" ? "text-xs" : "text-sm"
      }`}
    >
      {showIcon && (
        <Icon
          name="mdi:alert-circle"
          className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"}`}
        />
      )}
      <span className="flex-1">{errorMessage}</span>
      {onRetry && (
        <Button
          variant="ghost"
          size={size}
          onClick={onRetry}
          className="h-auto p-1 text-red-600 hover:text-red-700"
        >
          <Icon
            name="mdi:refresh"
            className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"}`}
          />
        </Button>
      )}
    </div>
  );
}
