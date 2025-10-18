"use client";

import React from "react";
import { FormInput } from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { useWatch, useFieldArray } from "react-hook-form";
import { Icon } from "@/components/icon";

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
          Split your token supply into several allocations and we&apos;ll make
          sure it totals 100%.
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
          Percent of total shares (e.g., Team 15%), check the current total
          before adding.
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
          Name the bucket (e.g., Team, Investors, Community, Treasury, Presale)
          so readers see where shares go.
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
          Months until shares unlock
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
          Date when this allocation&apos;s shares begin unlocking; pairs with
          the vesting duration.
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

export function AllocationForm({
  control,
  onBack,
  onNext,
  onSkip,
}: {
  control: any;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "allocations",
  });

  const allocations = useWatch({
    control,
    name: "allocations",
    defaultValue: [],
  });

  const totalPercent = allocations.reduce(
    (sum: number, a: { supply?: number | string }) =>
      sum + Number(a?.supply || 0),
    0
  );

  const addAllocation = () => {
    append({
      name: "",
      supply: 0,
      vesting: 0,
      startDate: new Date().toISOString(),
    });
  };

  const handleNext = async () => {
    // Check if total is 100%
    if (totalPercent !== 100) {
      return;
    }

    // Check if all required fields are filled
    const hasEmptyFields = allocations.some(
      (allocation: any) =>
        !allocation.name || !allocation.supply || allocation.supply <= 0
    );

    if (hasEmptyFields) {
      return;
    }

    onNext();
  };

  const removeAllocation = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Allocations</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Split your token supply into slices like Team, Community, Investors,
          Presale.
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((field: { id: string; name?: string }, index: number) => {
          const currentName = String(field.name || "")
            .trim()
            .toLowerCase();
          const isLocked =
            currentName === "presale" || currentName === "deployer";

          return (
            <div
              key={field.id}
              className="flex flex-col md:flex-row gap-2 md:items-end space-y-2"
            >
              <div className="flex-1">
                <label className="text-sm font-medium text-white mb-2 block">
                  Allocations
                </label>
                <FormInput
                  control={control}
                  name={`allocations.${index}.name`}
                  label=""
                  placeholder="e.g. Team"
                  disabled={isLocked}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-white mb-2 block">
                  Supply (%)
                </label>
                <FormInput
                  control={control}
                  name={`allocations.${index}.supply`}
                  label=""
                  placeholder="e.g. 1000"
                  type="number"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-white mb-2 block">
                  Lock Period (mo)
                </label>
                <FormInput
                  control={control}
                  name={`allocations.${index}.vesting`}
                  label=""
                  placeholder="1"
                  type="number"
                  min="1"
                  disabled={isLocked}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-white mb-2 block">
                  Start Date
                </label>
                <FormInput
                  control={control}
                  name={`allocations.${index}.startDate`}
                  label=""
                  placeholder="e.g. 6"
                  type="date"
                  disabled={isLocked}
                  min={
                    new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </div>
              <Button
                disabled={isLocked}
                className="ms-auto h-10 w-10"
                size="icon"
                type="button"
                variant="destructive"
                onClick={() => removeAllocation(index)}
              >
                <Icon name="tabler:trash" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between">
        <p
          className={`text-xs font-semibold ${
            totalPercent !== 100 ? "text-red-500" : "text-green-600"
          }`}
        >
          Total Allocation: {totalPercent}%
        </p>
        {totalPercent !== 100 && (
          <p className="text-xs font-semibold">Total Allocation Must be 100%</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          variant="secondary"
          disabled={totalPercent >= 100}
          type="button"
          onClick={addAllocation}
          className="flex items-center gap-2"
        >
          <Icon name="tabler:plus" />+ Allocation
        </Button>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="link" onClick={onSkip}>
            Skip
          </Button>
          <Button
            type="button"
            disabled={totalPercent !== 100}
            onClick={handleNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
