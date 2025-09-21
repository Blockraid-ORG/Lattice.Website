"use client";

import React from "react";
import { FormSelect } from "@/components/form-select";
import { FormInput } from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type BaseProps = {
  control: any;
  index: number;
  onBack: () => void;
  onNext: () => void;
};

export function PresaleUnit({
  control,
  index,
  onBack,
  onNext,
  units,
}: BaseProps & { units: any[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Presales Info</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Unit — What will buyers pay with—USDT or another token?
        </p>
        <FormSelect
          className="mt-2"
          control={control}
          name={`presales.${index}.unit`}
          label=""
          placeholder="Select unit"
          groups={[{ label: "Unit", options: units }]}
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

export function PresaleHardcap({ control, index, onBack, onNext }: BaseProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Presales Info</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Hard Cap — What’s the maximum you plan to raise this round—say 100000?
        </p>
        <FormInput
          control={control}
          name={`presales.${index}.hardcap`}
          label=""
          type="number"
          placeholder="e.g. 100000"
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

export function PresalePrice({ control, index, onBack, onNext }: BaseProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Presales Info</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Price Per Token — What’s the price for one token—like 0.01?
        </p>
        <FormInput
          control={control}
          name={`presales.${index}.price`}
          label=""
          type="number"
          placeholder="e.g. 0.01"
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

export function PresaleMaxContribution({
  control,
  index,
  onBack,
  onNext,
}: BaseProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Presales Info</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Max Contribution — What’s the per-wallet cap to keep things fair—maybe
          500?
        </p>
        <FormInput
          control={control}
          name={`presales.${index}.maxContribution`}
          label=""
          type="number"
          placeholder="e.g. 500"
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

export function PresaleStartDate({
  control,
  index,
  onBack,
  onNext,
}: BaseProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Presales Info</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Start Date — When will the sale open?
        </p>
        <FormInput
          control={control}
          name={`presales.${index}.startDate`}
          label=""
          type="datetime-local"
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

export function PresaleDuration({
  control,
  index,
  onBack,
  onNext,
  durations,
}: BaseProps & { durations: any[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Presales Info</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Duration — How long will the sale window stay open—like 14 days?
        </p>
        <FormSelect
          className="mt-2"
          control={control}
          name={`presales.${index}.duration`}
          label=""
          placeholder="Select duration"
          groups={[{ label: "Duration", options: durations }]}
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

export function PresaleClaimAfter({
  control,
  index,
  onBack,
  onNext,
  durations,
}: BaseProps & { durations: any[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Presales Info</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Claim Available After — When can buyers claim their tokens?
        </p>
        <FormSelect
          className="mt-2"
          control={control}
          name={`presales.${index}.claimTime`}
          label=""
          placeholder="Select time"
          groups={[{ label: "Duration", options: durations }]}
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

export function PresaleWhitelist({
  control,
  index,
  onBack,
  onNext,
  show,
  onToggle,
}: BaseProps & { show: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Presales Info</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Enable Whitelist — Do you want to restrict access so only approved
          wallets can join?
        </p>
        <div className="flex items-center space-x-2 mt-2">
          <Switch
            id="enable-whitelist"
            checked={show}
            onCheckedChange={onToggle}
          />
          <Label htmlFor="enable-whitelist">Enable Whitelist</Label>
        </div>
        {show && (
          <div className="mt-4">
            <FormInput
              control={control}
              name={`presales.${index}.whitelistDuration`}
              label="Whitelist Duration (hours)"
              type="number"
              placeholder="e.g. 24"
            />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Finish
        </Button>
      </div>
    </div>
  );
}
