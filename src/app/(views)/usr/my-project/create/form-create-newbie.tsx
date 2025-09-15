"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form-input";
import { FormSelect } from "@/components/form-select";
import { ImageDropzone } from "@/components/image-dropzone";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formCreateProjectSchema } from "@/modules/project/project.schema";
import { defaultValues } from "./default-value";
import { TFormProject } from "@/types/project";
import { useChainList } from "@/modules/chain/chain.query";
import { useCategoryList } from "@/modules/category/category.query";
import { useProjectTypeList } from "@/modules/project-types/project-types.query";
import { toUrlAsset } from "@/lib/utils";

type StepId =
  | "intro"
  | "cover"
  | "logo"
  | "name"
  | "ticker"
  | "decimals"
  | "chainId"
  | "categoryId"
  | "projectTypeId"
  | "totalSupply"
  | "detail";

type Step = {
  id: StepId;
  title: string;
  description?: string;
  validateFields?: string[];
};

const steps: Step[] = [
  {
    id: "intro",
    title: "Newbie Mode",
    description:
      "Mode — Choose how you want to start: I'm Web3 Native or I'm Web3 Newbie. In Newbie mode, friendly tips are enabled.",
  },
  {
    id: "cover",
    title: "Cover Image",
    description:
      "Can you set the scene with a wide banner that stays light so the page loads fast?",
  },
  {
    id: "logo",
    title: "Logo",
    description:
      "Will you add a crisp square logo so people recognize you at a glance?",
  },
  {
    id: "name",
    title: "Name",
    description: "What should we call your project?",
    validateFields: ["name"],
  },
  {
    id: "ticker",
    title: "Ticker",
    description: "e.g. SPN",
    validateFields: ["ticker"],
  },
  {
    id: "decimals",
    title: "Decimal",
    description: "Usually 18",
    validateFields: ["decimals"],
  },
  {
    id: "chainId",
    title: "Select Chain",
    description: "Start with BNB if you're new",
    validateFields: ["chainId"],
  },
  {
    id: "categoryId",
    title: "Select Category",
    description: "Pick the best fit",
    validateFields: ["categoryId"],
  },
  {
    id: "projectTypeId",
    title: "Select Type",
    description: "Equity, Debt, or Fund",
    validateFields: ["projectTypeId"],
  },
  {
    id: "totalSupply",
    title: "Total Supply",
    description: "e.g. 100000000",
    validateFields: ["totalSupply"],
  },
  {
    id: "detail",
    title: "Description",
    description: "One or two lines to introduce your project",
    validateFields: ["detail"],
  },
];

export default function FormCreateNewbie() {
  const [currentStep, setCurrentStep] = useState<StepId>("intro");
  const [banner, setBanner] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);

  const form = useForm<TFormProject>({
    resolver: zodResolver(formCreateProjectSchema),
    defaultValues: defaultValues,
    mode: "onChange",
  });

  const { data: chains } = useChainList();
  const { data: categories } = useCategoryList();
  const { data: projectTypes } = useProjectTypeList();
  const currentIndex = useMemo(
    () => steps.findIndex((s) => s.id === currentStep),
    [currentStep]
  );
  const totalSteps = steps.length;

  function goNext() {
    const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
    setCurrentStep(steps[nextIndex].id);
  }
  function goBack() {
    const prevIndex = Math.max(currentIndex - 1, 0);
    setCurrentStep(steps[prevIndex].id);
  }

  async function validateAndNext() {
    const step = steps[currentIndex];
    if (step.validateFields && step.validateFields.length > 0) {
      const ok = await form.trigger(step.validateFields as any);
      if (!ok) return;
    }
    goNext();
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-3">
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

      <Form {...form}>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {currentStep === "intro" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-center">
                Newbie Mode
              </h2>
              <p className="text-muted-foreground text-center">
                Mode — Choose how you want to start: I&apos;m Web3 Native or
                I&apos;m Web3 Newbie. In Newbie mode, friendly tips are enabled.
              </p>
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled
                >
                  Back
                </Button>
                <Button type="button" onClick={goNext}>
                  Start
                </Button>
              </div>
            </div>
          )}

          {currentStep === "cover" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Cover Image</h3>
                <p className="text-sm text-muted-foreground">
                  Can you set the scene with a wide banner that stays light so
                  the page loads fast?
                </p>
                <div className="mt-3">
                  <ImageDropzone
                    className="aspect-[12/4] bg-white dark:bg-slate-900"
                    onChange={(file) => setBanner(file)}
                  />
                  {banner && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected: {banner.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button type="button" variant="outline" onClick={goBack}>
                  Back
                </Button>
                <Button type="button" onClick={goNext}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {currentStep === "logo" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Logo</h3>
                <p className="text-sm text-muted-foreground">
                  Will you add a crisp square logo so people recognize you at a
                  glance?
                </p>
                <div className="w-40 mt-3">
                  <ImageDropzone
                    className="aspect-square bg-white dark:bg-slate-900"
                    onChange={(file) => setLogo(file)}
                  />
                </div>
                {logo && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {logo.name}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button type="button" variant="outline" onClick={goBack}>
                  Back
                </Button>
                <Button type="button" onClick={goNext}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {currentStep === "name" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Name</h3>
                <p className="text-sm text-muted-foreground mt-0">
                  What should we call your company or project?
                </p>
                <FormInput
                  control={form.control}
                  name="name"
                  label=""
                  placeholder=""
                />
                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="outline" onClick={goBack}>
                    Back
                  </Button>
                  <Button type="button" onClick={validateAndNext}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "ticker" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Ticker</h3>
                <p className="text-sm text-muted-foreground mt-0">
                  Which CAPS ticker will you fly under—any length you like, with
                  3–5 letters recommended, like SPN
                </p>
                <FormInput
                  control={form.control}
                  name="ticker"
                  label=""
                  placeholder="e.g. SPN"
                />
                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="outline" onClick={goBack}>
                    Back
                  </Button>
                  <Button type="button" onClick={validateAndNext}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "decimals" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Decimal</h3>
                <p className="text-sm text-muted-foreground mt-0">
                  Shall we keep decimals at 18 so everything runs smoothly?
                </p>
                <FormInput
                  control={form.control}
                  name="decimals"
                  label=""
                  type="number"
                  placeholder="Usually 18"
                />
                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="outline" onClick={goBack}>
                    Back
                  </Button>
                  <Button type="button" onClick={validateAndNext}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "chainId" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Select Chain</h3>
                <p className="text-sm text-muted-foreground mt-0">
                  Which network will be home for your launch—start with BNB if
                  you’re new?
                </p>
                {chains && (
                  <FormSelect
                    className="mt-2"
                    control={form.control}
                    name="chainId"
                    label=""
                    placeholder=""
                    onChangeValue={() => {}}
                    groups={[
                      {
                        label: "Network",
                        options: chains.map((i) => ({
                          ...i,
                          iconUrl: i.logo && toUrlAsset(i.logo),
                        })),
                      },
                    ]}
                  />
                )}
                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="outline" onClick={goBack}>
                    Back
                  </Button>
                  <Button type="button" onClick={validateAndNext}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "categoryId" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Select Category</h3>
                <p className="text-sm text-muted-foreground mt-0">
                  Where does your project live in the business world—what
                  category fits best?
                </p>
                {categories && (
                  <FormSelect
                    className="mt-2"
                    control={form.control}
                    name="categoryId"
                    label=""
                    placeholder="Pick the best fit"
                    groups={[
                      {
                        label: "Category",
                        options: categories.map((i) => ({
                          ...i,
                          iconName: i.icon,
                        })),
                      },
                    ]}
                  />
                )}
                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="outline" onClick={goBack}>
                    Back
                  </Button>
                  <Button type="button" onClick={validateAndNext}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "projectTypeId" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Select Type</h3>
                <p className="text-sm text-muted-foreground mt-0">
                  Which raise style will you choose: Equity, Debt, or Fund?
                </p>
                {projectTypes && (
                  <FormSelect
                    className="mt-2"
                    control={form.control}
                    name="projectTypeId"
                    label=""
                    placeholder=""
                    groups={[
                      {
                        label: "Project Type",
                        options: projectTypes.map((i) => ({
                          ...i,
                          iconName: i.icon,
                        })),
                      },
                    ]}
                  />
                )}
                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="outline" onClick={goBack}>
                    Back
                  </Button>
                  <Button type="button" onClick={validateAndNext}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "totalSupply" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Total Supply</h3>
                <p className="text-sm text-muted-foreground mt-0">
                  What total token count will you mint—say 100000000?
                </p>
                <FormInput
                  control={form.control}
                  name="totalSupply"
                  label=""
                  placeholder="e.g. 100000000"
                />
                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="outline" onClick={goBack}>
                    Back
                  </Button>
                  <Button type="button" onClick={validateAndNext}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "detail" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground mt-0">
                  In one or two lines, how would you introduce your project to
                  someone new?
                </p>
                <FormInput
                  control={form.control}
                  name="detail"
                  isLongText
                  label=""
                  placeholder="One or two lines to introduce your project"
                />
                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="outline" onClick={goBack}>
                    Back
                  </Button>
                  <Button type="button" onClick={validateAndNext}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
