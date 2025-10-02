"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormCreate from "./form-create";
import FormCreateNewbie from "./form-create-newbie";
import { useFormCreateProject } from "@/store/useFormCreateProject";

export default function CreateProjectPage() {
  const [open, setOpen] = useState(true);
  const { formType, setFormType } = useFormCreateProject();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [hasChosen, setHasChosen] = useState(false);

  const { reset: resetFormCreateProject } = useFormCreateProject();

  useEffect(() => {
    try {
      const hidden =
        typeof window !== "undefined" &&
        localStorage.getItem("createModeDialogHidden") === "true";
      const preferred =
        typeof window !== "undefined"
          ? (localStorage.getItem("createPreferredFormType") as
              | "newbie"
              | "advanced"
              | null)
          : null;
      if (hidden) {
        if (preferred) setFormType(preferred);
        setOpen(false);
      }
    } catch {}
  }, [setFormType]);

  function handleChangeNativeForm() {
    setHasChosen(true);
    setFormType("advanced");
    setOpen(false);
    if (dontShowAgain) {
      try {
        localStorage.setItem("createModeDialogHidden", "true");
        localStorage.setItem("createPreferredFormType", "advanced");
      } catch {}
    }
  }

  function handleChangeNewbieForm() {
    setHasChosen(true);
    setFormType("newbie");
    setOpen(false);
    if (dontShowAgain) {
      try {
        localStorage.setItem("createModeDialogHidden", "true");
        localStorage.setItem("createPreferredFormType", "newbie");
      } catch {}
    }
  }

  // Reset state global when component unmounts
  useEffect(() => {
    return () => {
      resetFormCreateProject();
    };
  }, [resetFormCreateProject]);

  return (
    <>
      <div className="max-w-5xl mx-auto px-3 pt-6">
        {formType === "newbie" && <FormCreateNewbie />}
        {formType === "advanced" && <FormCreate />}
      </div>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !hasChosen) return;
          setOpen(nextOpen);
        }}
      >
        <DialogContent
          hideClose
          onPointerDownOutside={(e) => {
            if (!hasChosen) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (!hasChosen) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>How do you identify yourself?</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="secondary" onClick={handleChangeNewbieForm}>
              Web3 Beginner
            </Button>
            <Button onClick={handleChangeNativeForm}>Web3 Native</Button>
          </div>
          <div className="flex items-center gap-2 pt-3">
            <input
              id="dont-show-again"
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <label
              htmlFor="dont-show-again"
              className="text-sm text-muted-foreground"
            >
              Don&apos;t show this again
            </label>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
