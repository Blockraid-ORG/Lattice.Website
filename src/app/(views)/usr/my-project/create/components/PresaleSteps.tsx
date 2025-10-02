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
          Payment asset buyers will use (e.g., <strong>USDC</strong> or{" "}
          <strong>BNB</strong>); pick what fits your chosen chain.
        </p>
        <FormSelect
          className="mt-2"
          control={control}
          name={`presales.${index}.unit`}
          label=""
          placeholder="Select unit"
          groups={[{ options: units }]}
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
            <label htmlFor="enable-whitelist">Whitelist Duration (hours)</label>
            <p className="text-sm text-muted-foreground mt-0">
              How long the allowlist stays open (e.g., <strong>10 hours</strong>{" "}
              or <strong>0</strong> for none); only approved wallets can join
              during this window.
            </p>
            <FormInput
              control={control}
              name={`presales.${index}.whitelistDuration`}
              label=""
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
