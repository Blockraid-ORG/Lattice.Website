import { toast } from "sonner"

type TMessage = {
  header?: string
  description?: string
}

type TNotifOption = {
  url?: string
  label?: string
  delayRedirect?: number // optional: delay sebelum redirect (ms)
}

/**
 * Global success message helper
 * - Bisa dipakai di mana saja
 * - Mendukung redirect ke URL tertentu
 * - Opsional delay redirect
 */
export const successMessage = (
  message: TMessage,
  options?: TNotifOption
) => {
  const {
    url,
    label = "View Transaction",
    delayRedirect = 500,
  } = options || {}

  toast.success(message.header ?? "Success", {
    description: message.description ?? "Transaction completed successfully.",
    action: url
      ? {
        label,
        onClick: () => {
          if (url) {
            setTimeout(() => {
              window.open(url, "_blank", "noopener,noreferrer")
            }, delayRedirect)
          }
        },
      }
      : undefined,
  })
}
