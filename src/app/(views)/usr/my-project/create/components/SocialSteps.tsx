"use client";

import React, { useEffect } from "react";
import { FormSelect } from "@/components/form-select";
import { FormInput } from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { useFieldArray, useWatch } from "react-hook-form";

// type PlatformProps = {
//   socialsOptions: { label: string; value: string; iconName?: string }[];
//   control: any;
//   socialIndex: number;
//   onBack: () => void;
//   onSkip: () => void;
//   onNext: () => void;
// };

// export function SocialPlatform({
//   socialsOptions,
//   control,
//   onBack,
//   onSkip,
//   onNext,
//   socialIndex,
// }: PlatformProps) {
//   return (
//     <div className="space-y-4">
//       <div>
//         <h3 className="text-xl font-semibold">Platform</h3>
//         <p className="text-sm text-muted-foreground mt-0">
//           Choose the website or social platform you&apos;ll share (Site,
//           X/Twitter, Discord, etc.).
//         </p>
//         <FormSelect
//           className="mt-2"
//           control={control}
//           name={`socials.${socialIndex}.socialId`}
//           label=""
//           placeholder="Select platform"
//           groups={[{ label: "Social", options: socialsOptions }]}
//         />
//       </div>
//       <div className="flex items-center justify-between pt-2">
//         <Button type="button" variant="outline" onClick={onBack}>
//           Back
//         </Button>
//         <div className="flex items-center gap-2">
//           <Button type="button" variant="link" onClick={onSkip}>
//             Skip
//           </Button>
//           <Button type="button" onClick={onNext}>
//             Next
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// type UrlProps = {
//   control: any;
//   socialIndex: number;
//   onBack: () => void;
//   onNext: () => void;
// };

// export function SocialUrl({ control, onBack, onNext, socialIndex }: UrlProps) {
//   return (
//     <div className="space-y-4">
//       <div>
//         <h3 className="text-xl font-semibold">URL</h3>
//         <p className="text-sm text-muted-foreground mt-0">
//           Paste a working link to your site or social page; test it opens
//           correctly.
//         </p>
//         <FormInput
//           control={control}
//           name={`socials.${socialIndex}.url`}
//           label=""
//           placeholder="https://..."
//         />
//       </div>
//       <div className="flex items-center justify-between pt-2">
//         <Button type="button" variant="outline" onClick={onBack}>
//           Back
//         </Button>
//         <div className="flex items-center gap-2">
//           <Button type="button" onClick={onNext}>
//             Next
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// type AddMoreProps = {
//   onBack: () => void;
//   onAddAnother: () => void;
//   onNext: () => void;
//   onSkip: () => void;
// };

// export function SocialAddMore({
//   onBack,
//   onAddAnother,
//   onNext,
//   onSkip,
// }: AddMoreProps) {
//   return (
//     <div className="space-y-4">
//       <div>
//         <h3 className="text-xl font-semibold">+ Add Social</h3>
//       </div>
//       <div className="flex items-center justify-between pt-2">
//         <Button type="button" variant="outline" onClick={onBack}>
//           Back
//         </Button>
//         <div className="flex items-center gap-2">
//           <Button type="button" variant="link" onClick={onSkip}>
//             Skip
//           </Button>
//           <Button type="button" variant="secondary" onClick={onAddAnother}>
//             Yes, add another
//           </Button>
//           <Button type="button" onClick={onNext}>
//             No, continue
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

type SocialMediaFormProps = {
  socialsOptions: { label: string; value: string; iconName?: string }[];
  control: any;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  socialsValues?: { socialId: string; url: string }[];
  setValue?: any;
};

export function SocialMediaForm({
  socialsOptions,
  control,
  onBack,
  onNext,
  onSkip,
  socialsValues = [],
  setValue,
}: SocialMediaFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "socials",
  });

  // Watch socials values for filtering
  const watchedSocialsValues = useWatch({
    control,
    name: "socials",
    defaultValue: socialsValues,
  });

  // Function to get available social platforms for a specific field index
  const getAvailableSocialPlatforms = (currentIndex: number) => {
    if (!socialsOptions) return [];

    // Get all selected social IDs except the current field
    const selectedSocialIds = watchedSocialsValues
      .map((social: { socialId: string; url: string }, index: number) =>
        index !== currentIndex ? social.socialId : null
      )
      .filter(Boolean);

    // Filter out already selected platforms
    return socialsOptions.filter(
      (social) => !selectedSocialIds.includes(social.value)
    );
  };

  // Set default email value for first field
  useEffect(() => {
    if (
      socialsOptions?.length > 0 &&
      fields?.length > 0 &&
      setValue &&
      !watchedSocialsValues?.[0]?.socialId
    ) {
      const emailPlatform = socialsOptions.find(
        (social) =>
          social.label.toLowerCase().includes("email") ||
          social.label.toLowerCase().includes("mail")
      );

      if (emailPlatform) {
        setValue("socials.0.socialId", emailPlatform.value);
      }
    }
  }, [socialsOptions, fields.length, setValue, watchedSocialsValues]);

  const addSocial = () => {
    append({ socialId: "", url: "" });
  };

  // Check if all social platforms are already selected
  const isAllPlatformsSelected = () => {
    if (!socialsOptions || socialsOptions.length === 0) return true;

    const selectedPlatforms = watchedSocialsValues
      .map((social: { socialId: string; url: string }) => social.socialId)
      .filter(Boolean);

    return selectedPlatforms.length >= socialsOptions.length;
  };

  const removeSocial = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Website / Social Media</h3>
        <p className="text-sm text-muted-foreground mt-0">
          Add your website and social media links to help users find you.
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-white mb-2 block">
                Platform
              </label>
              <FormSelect
                control={control}
                name={`socials.${index}.socialId`}
                label=""
                placeholder="Select platform"
                groups={[{ options: getAvailableSocialPlatforms(index) }]}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-white mb-2 block">
                URL
              </label>
              <FormInput
                control={control}
                name={`socials.${index}.url`}
                label=""
                placeholder={
                  index === 0 ? "example@email.com" : "https://example.com"
                }
              />
            </div>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={index === 0}
                onClick={() => removeSocial(index)}
                className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={addSocial}
          disabled={isAllPlatformsSelected()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Social
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
          <Button type="button" onClick={onNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
