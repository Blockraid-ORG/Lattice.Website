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
        <h3 className="text-xl font-semibold">Allocations</h3>
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
          What percentage of total supply does this row deserve?
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
          How will you split supply across team, investors, community, and
          others?
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
        <h3 className="text-xl font-semibold">Vesting (mo)</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Over how many months should this portion unlock—use 0 for no lock?
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
        <h3 className="text-xl font-semibold">Start Date</h3>
        <p className="text-sm text-muted-foreground mt-0">
          When should unlocking begin for this row?
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
