"use client";

import React from "react";

type Props = {
  currentIndex: number;
  totalSteps: number;
};

export default function ProgressHeader({ currentIndex, totalSteps }: Props) {
  return (
    <div className="mb-6 text-center">
      <p className="text-xs text-muted-foreground">
        Step {currentIndex + 1} / {totalSteps}
      </p>
      <div className="h-1 bg-muted rounded mt-2">
        <div
          className="h-1 bg-primary rounded"
          style={{ width: `${((currentIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}


