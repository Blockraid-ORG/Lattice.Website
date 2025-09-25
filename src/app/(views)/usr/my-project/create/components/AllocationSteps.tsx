"use client";

import React from "react";
import { FormInput } from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { useWatch } from "react-hook-form";

export function AllocationIntro({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Allocations (set per row)</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Split your token supply. You can add multiple slices and we&apos;ll
          make sure it totals 100%.
        </p>
      </div>
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Start
        </Button>
      </div>
    </div>
  );
}

export function AllocationSupply({
  control,
  index,
  onBack,
  onNext,
  currentTotal,
}: {
  control: any;
  index: number;
  onBack: () => void;
  onNext: () => void;
  currentTotal: number;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Supply (%)</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Percent of total shares for this row (e.g., Team 15%); the sum of all rows must equal 100%.
        </p>
        <FormInput
          control={control}
          name={`allocations.${index}.supply`}
          label=""
          type="number"
          placeholder="e.g. 10"
        />
        <p
          className={`text-xs mt-2 ${
            currentTotal > 100 ? "text-red-500" : "text-muted-foreground"
          }`}
        >
          Current total: {currentTotal}%
        </p>
      </div>
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function AllocationName({
  control,
  index,
  onBack,
  onNext,
}: {
  control: any;
  index: number;
  onBack: () => void;
  onNext: () => void;
}) {
  const currentName = useWatch({
    control,
    name: `allocations.${index}.name` as const,
  });
  const isLocked =
    String(currentName || "")
      .trim()
      .toLowerCase()
      .match(/^(presale|deployer)$/) !== null;
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Allocation</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Name the bucket (e.g., Team, Investors, Community, Treasury, Presale) so readers see where shares go.
        </p>
        <FormInput
          control={control}
          name={`allocations.${index}.name`}
          label=""
          placeholder="e.g. Team"
          disabled={isLocked}
        />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function AllocationVesting({
  control,
  index,
  onBack,
  onNext,
}: {
  control: any;
  index: number;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Lock Period (mo)</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Months until shares unlock; use <strong>0</strong> for no lock; longer
          vesting can align incentives.
        </p>
        <FormInput
          control={control}
          name={`allocations.${index}.vesting`}
          label=""
          type="number"
          placeholder="e.g. 6"
        />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function AllocationStartDate({
  control,
  index,
  onBack,
  onNext,
}: {
  control: any;
  index: number;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Start Date (vesting)</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Date when this row’s shares begin unlocking; pairs with the vesting
          duration.
        </p>
        <FormInput
          control={control}
          name={`allocations.${index}.startDate`}
          label=""
          type="date"
        />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
