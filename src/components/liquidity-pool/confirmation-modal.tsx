"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { toast } from "sonner";

interface ConfirmationModalProps {
  showConfirmModal: boolean;
  setShowConfirmModal: (open: boolean) => void;
  setOpen: (open: boolean) => void;
  rangeType: string;
  minPrice: string;
  maxPrice: string;
  startingPrice: string;
  baseToken: string;
  bnbAmount: string;
  buAmount: string;
}

export function ConfirmationModal({
  showConfirmModal,
  setShowConfirmModal,
  setOpen,
  rangeType,
  minPrice,
  maxPrice,
  startingPrice,
  baseToken,
  bnbAmount,
  buAmount,
}: ConfirmationModalProps) {
  return (
    <Dialog
      open={showConfirmModal}
      onOpenChange={(open) => {
        setShowConfirmModal(open);
        if (!open) {
          setOpen(true); // Reopen main modal when closing confirmation
        }
      }}
    >
      <DialogContent className="max-w-md w-full p-2">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                Membuat posisi
              </DialogTitle>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-muted-foreground"
                >
                  <Icon name="mdi:help-circle" className="w-4 h-4 mr-2" />
                  Minta bantuan
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Pair Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Icon name="cryptocurrency-color:bnb" className="w-6 h-6" />
                  <Icon name="cryptocurrency-color:btc" className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">BNB / BU</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-muted px-2 py-1 rounded text-xs">v4</span>
                <span className="bg-muted px-2 py-1 rounded text-xs">0.3%</span>
              </div>
            </div>

            {/* Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Minimum
                </div>
                <div className="font-mono text-sm">
                  {rangeType === "full" ? "0" : minPrice} BU/BNB
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Maks</div>
                <div className="font-mono text-sm">
                  {rangeType === "full" ? "∞" : maxPrice} BU/BNB
                </div>
              </div>
            </div>

            {/* Starting Price */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Harga awal
              </div>
              <div className="font-mono text-lg">
                {baseToken === "BNB"
                  ? `<${startingPrice} BU = 1 BNB`
                  : `<${startingPrice} BNB = 1 BU`}
              </div>
              <div className="text-sm text-muted-foreground">(-)</div>
            </div>

            {/* Deposit Amounts */}
            <div>
              <div className="text-sm text-muted-foreground mb-3">
                Menyetorkan
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name="cryptocurrency-color:bnb" className="w-6 h-6" />
                    <div>
                      <div className="font-mono text-lg">
                        {bnbAmount || "0.000300780112327585"} BNB
                      </div>
                      <div className="text-sm text-muted-foreground">
                        US$0.265
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    0.0168 BNB
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">BU</span>
                    </div>
                    <div>
                      <div className="font-mono text-lg">
                        {buAmount || "0.00000000000000003"} BU
                      </div>
                      <div className="text-sm text-muted-foreground">-</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">1.000 BU</div>
                </div>
              </div>
            </div>

            {/* Network Fee */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Biaya jaringan
              </div>
              <div className="flex items-center gap-2">
                <Icon name="mdi:alert" className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">&lt;US$0,01</span>
              </div>
            </div>

            {/* Create Button */}
            <Button
              className="w-full h-12 bg-pink-600 hover:bg-pink-700 text-white"
              onClick={() => {
                toast.success("Posisi berhasil dibuat!");
                setShowConfirmModal(false);
                // Don't need setOpen(false) here since main modal is already closed
              }}
            >
              Buat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
