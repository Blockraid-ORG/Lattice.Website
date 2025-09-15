"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormCreate from "./form-create";
import FormCreateNewbie from "./form-create-newbie";

export default function CreateProjectPage() {
  const [open, setOpen] = useState(true);
  const [formType, setFormType] = useState<"newbie" | "advanced" | null>(null);

  return (
    <>
      <div className="max-w-5xl mx-auto px-3 pt-6">
        {formType === "newbie" && <FormCreateNewbie />}
        {formType === "advanced" && <FormCreate />}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideClose>
          <DialogHeader>
            <DialogTitle>
              Choose how you want to start: I&apos;m Web3 Native or I&apos;m
              Web3 Newbie
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setFormType("newbie");
                setOpen(false);
              }}
            >
              I&apos;m Web3 Newbie
            </Button>
            <Button
              onClick={() => {
                setFormType("advanced");
                setOpen(false);
              }}
            >
              I&apos;m Web3 Native
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
