"use client";

import React from "react";
import { FormSelect } from "@/components/form-select";
import { FormInput } from "@/components/form-input";
import { Button } from "@/components/ui/button";

type PlatformProps = {
  socialsOptions: { label: string; value: string; iconName?: string }[];
  control: any;
  socialIndex: number;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
};

export function SocialPlatform({
  socialsOptions,
  control,
  onBack,
  onSkip,
  onNext,
  socialIndex,
}: PlatformProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Platform</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Choose the website or social platform you&apos;ll share (Site,
          X/Twitter, Discord, etc.).
        </p>
        <FormSelect
          className="mt-2"
          control={control}
          name={`socials.${socialIndex}.socialId`}
          label=""
          placeholder="Select platform"
          groups={[{ label: "Social", options: socialsOptions }]}
        />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="link" onClick={onSkip}>
            Skip
          </Button>
          <Button type="button" onClick={onNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

type UrlProps = {
  control: any;
  socialIndex: number;
  onBack: () => void;
  onNext: () => void;
};

export function SocialUrl({ control, onBack, onNext, socialIndex }: UrlProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">URL</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Paste a working link to your site or social page; test it opens
          correctly.
        </p>
        <FormInput
          control={control}
          name={`socials.${socialIndex}.url`}
          label=""
          placeholder="https://..."
        />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={onNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

type AddMoreProps = {
  onBack: () => void;
  onAddAnother: () => void;
  onNext: () => void;
  onSkip: () => void;
};

export function SocialAddMore({
  onBack,
  onAddAnother,
  onNext,
  onSkip,
}: AddMoreProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">+ Add Social</h3>
      </div>
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="link" onClick={onSkip}>
            Skip
          </Button>
          <Button type="button" variant="secondary" onClick={onAddAnother}>
            Yes, add another
          </Button>
          <Button type="button" onClick={onNext}>
            No, continue
          </Button>
        </div>
      </div>
    </div>
  );
}
