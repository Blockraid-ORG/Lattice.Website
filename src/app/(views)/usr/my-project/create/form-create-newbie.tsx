"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form-input";
import { FormSelect } from "@/components/form-select";
import { ImageDropzone } from "@/components/image-dropzone";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
// moved to modular PresaleSteps
import { formCreateProjectSchema } from "@/modules/project/project.schema";
import { defaultValues } from "./default-value";
import { TFormProject } from "@/types/project";
import { useChainList } from "@/modules/chain/chain.query";
import { useCategoryList } from "@/modules/category/category.query";
import { useProjectTypeList } from "@/modules/project-types/project-types.query";
import { useSocialList } from "@/modules/social/chain.query";
import { toUrlAsset } from "@/lib/utils";
import { StepId } from "@/types/form-create-project";
import { steps } from "@/data/form-create-project";
import ProgressHeader from "./components/ProgressHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  SocialPlatform,
  SocialUrl,
  SocialAddMore,
} from "./components/SocialSteps";
import {
  AllocationIntro,
  AllocationSupply,
  AllocationName,
  AllocationVesting,
  AllocationStartDate,
} from "./components/AllocationSteps";
import { PresaleUnit, PresaleWhitelist } from "./components/PresaleSteps";
import { useFormCreateProject } from "@/store/useFormCreateProject";

export default function FormCreateNewbie() {
  const [currentStep, setCurrentStep] = useState<StepId>("intro");
  const [banner, setBanner] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [socialIndex, setSocialIndex] = useState(0);
  const [allocationIndex, setAllocationIndex] = useState(0);
  const [presaleIndex] = useState(0);
  const [showWhitelist, setShowWhitelist] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const form = useForm<TFormProject>({
    resolver: zodResolver(formCreateProjectSchema),
    defaultValues: defaultValues,
    mode: "onChange",
  });

  const { data: chains } = useChainList();
  const { data: categories } = useCategoryList();
  const { data: projectTypes } = useProjectTypeList();
  const { data: socials } = useSocialList();
  const { fields: socialFields, append: appendSocial } = useFieldArray({
    control: form.control,
    name: "socials",
  });
  const { fields: allocationFields, append: appendAllocation } = useFieldArray({
    control: form.control,
    name: "allocations",
  });
  const { fields: presalesFields } = useFieldArray({
    control: form.control,
    name: "presales",
  });
  const allocations = form.watch("allocations");
  const totalAllocationPercent = (allocations || []).reduce(
    (sum: number, a: any) => sum + Number(a?.supply || 0),
    0
  );
  const isSimpleAllocation = useMemo(() => {
    const name = String(allocations?.[allocationIndex]?.name || "")
      .trim()
      .toLowerCase();
    return name === "deployer" || name === "presale";
  }, [allocations, allocationIndex]);
  const selectedChainId = form.watch("chainId");
  const selectedChain = useMemo(
    () => chains?.find((c: any) => c.value === selectedChainId),
    [chains, selectedChainId]
  );
  const tokenUnits = useMemo(
    () => [
      {
        label: `${selectedChain?.ticker ?? ""}`,
        value: `${selectedChain?.ticker ?? ""}`,
      },
      { label: "USDC", value: "USDC", disabled: true },
      { label: "USDT", value: "USDT", disabled: true },
    ],
    [selectedChain]
  );
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
    if (currentStep === "socialPlatform") {
      const ok = await form.trigger([`socials.${socialIndex}.socialId`] as any);
      if (!ok) return;
      goNext();
      return;
    }
    if (currentStep === "socialUrl") {
      const ok = await form.trigger([`socials.${socialIndex}.url`] as any);
      if (!ok) return;
      goNext();
      return;
    }
    if (currentStep === "allocSupply") {
      const ok = await form.trigger([
        `allocations.${allocationIndex}.supply`,
      ] as any);
      if (!ok) return;
      if (isSimpleAllocation) {
        const currentName = String(allocations?.[allocationIndex]?.name || "")
          .trim()
          .toLowerCase();
        if (currentName === "deployer") {
          const presaleIdx = (allocations || []).findIndex(
            (a: any) =>
              String(a?.name || "")
                .trim()
                .toLowerCase() === "presale"
          );
          if (presaleIdx !== -1) {
            setAllocationIndex(presaleIdx);
            setCurrentStep("allocName");
            return;
          }
        }
        setCurrentStep("allocAddMore");
      } else {
        goNext();
      }
      return;
    }
    if (currentStep === "allocName") {
      const ok = await form.trigger([
        `allocations.${allocationIndex}.name`,
      ] as any);
      if (!ok) return;
      goNext();
      return;
    }
    if (currentStep === "allocVesting") {
      const ok = await form.trigger([
        `allocations.${allocationIndex}.vesting`,
      ] as any);
      if (!ok) return;
      goNext();
      return;
    }
    if (currentStep === "allocStartDate") {
      const ok = await form.trigger([
        `allocations.${allocationIndex}.startDate`,
      ] as any);
      if (!ok) return;
      goNext();
      return;
    }
    if (step.validateFields && step.validateFields.length > 0) {
      const ok = await form.trigger(step.validateFields as any);
      if (!ok) return;
    }
    goNext();
  }

  function appendEmptyAllocationAndStart() {
    const nextName = getNextDefaultAllocationName();
    appendAllocation({
      name: nextName,
      supply: 0,
      vesting: 0,
      startDate: new Date().toISOString(),
    } as any);
    setAllocationIndex(allocationFields.length);
    setCurrentStep("allocSupply");
  }

  // Next Form Advanced
  const { setForm, setFormType, setMedia } = useFormCreateProject();

  function handoffToNativeForm() {
    const draft = form.getValues();
    setForm(draft);
    setFormType("advanced");
    // pass previews to global store so advanced form can show them
    setMedia({
      logoFile: logo,
      bannerFile: banner,
      logoPreview: logo ? URL.createObjectURL(logo) : null,
      bannerPreview: banner ? URL.createObjectURL(banner) : null,
    });
  }
  // END Next Form Advanced
  function addAnotherSocial() {
    appendSocial({ socialId: "", url: "" } as any);
    setSocialIndex(socialFields.length); // new index
    setCurrentStep("socialPlatform");
  }

  function getNextDefaultAllocationName(): string {
    const existingNames = (form.getValues("allocations") || []).map((a: any) =>
      String(a?.name || "")
        .trim()
        .toLowerCase()
    );
    if (!existingNames.includes("deployer")) return "Deployer";
    if (!existingNames.includes("presale")) return "Presale";
    return "";
  }

  function handleChangeBanner(file: File | null) {
    setBanner(file);
    if (file) {
      setBannerPreviewUrl(URL.createObjectURL(file));
    }
  }

  function handleChangeLogo(file: File | null) {
    setLogo(file);
    if (file) {
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  }

  // Revoke object URLs when previews change or on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    };
  }, [bannerPreviewUrl]);
  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  useEffect(() => {
    if (socialFields.length === 0) {
      appendSocial({ socialId: "", url: "" } as any);
    }
    if (allocationFields.length === 0) {
      appendAllocation({
        name: "Deployer",
        supply: 0,
        vesting: 0,
        startDate: new Date().toISOString(),
      } as any);
      appendAllocation({
        name: "Presale",
        supply: 0,
        vesting: 0,
        startDate: new Date().toISOString(),
      } as any);
    }
    if ((presalesFields?.length ?? 0) === 0) {
      // ensure one presale row exists
      form.setValue("presales", [
        {
          unit: "",
          whitelistDuration: 0,
        },
      ] as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8 px-3">
      <ProgressHeader currentIndex={currentIndex} totalSteps={totalSteps} />

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
                  variant="link"
                  onClick={handoffToNativeForm}
                >
                  Skip
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
                    externalPreview={bannerPreviewUrl ?? undefined}
                    onChange={(file) => handleChangeBanner(file)}
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
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handoffToNativeForm}
                  >
                    Skip
                  </Button>
                  <Button type="button" onClick={goNext}>
                    Next
                  </Button>
                </div>
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
                    externalPreview={logoPreviewUrl ?? undefined}
                    onChange={(file) => handleChangeLogo(file)}
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
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handoffToNativeForm}
                  >
                    Skip
                  </Button>
                  <Button type="button" onClick={goNext}>
                    Next
                  </Button>
                </div>
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
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handoffToNativeForm}
                    >
                      Skip
                    </Button>
                    <Button type="button" onClick={validateAndNext}>
                      Next
                    </Button>
                  </div>
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
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handoffToNativeForm}
                    >
                      Skip
                    </Button>
                    <Button type="button" onClick={validateAndNext}>
                      Next
                    </Button>
                  </div>
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
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handoffToNativeForm}
                    >
                      Skip
                    </Button>
                    <Button type="button" onClick={validateAndNext}>
                      Next
                    </Button>
                  </div>
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
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handoffToNativeForm}
                    >
                      Skip
                    </Button>
                    <Button type="button" onClick={validateAndNext}>
                      Next
                    </Button>
                  </div>
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
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handoffToNativeForm}
                    >
                      Skip
                    </Button>
                    <Button type="button" onClick={validateAndNext}>
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === "projectTypeId" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Select Type</h3>
                <p className="text-sm text-muted-foreground mt-0">
                  Which raise style will you choose: Equity or Debt?
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
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handoffToNativeForm}
                    >
                      Skip
                    </Button>
                    <Button type="button" onClick={validateAndNext}>
                      Next
                    </Button>
                  </div>
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
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handoffToNativeForm}
                    >
                      Skip
                    </Button>
                    <Button type="button" onClick={validateAndNext}>
                      Next
                    </Button>
                  </div>
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
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handoffToNativeForm}
                    >
                      Skip
                    </Button>
                    <Button type="button" onClick={validateAndNext}>
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === "socialPlatform" && (
            <SocialPlatform
              socialsOptions={
                socials
                  ? socials.map((i: any) => ({ ...i, iconName: i.icon }))
                  : []
              }
              control={form.control}
              socialIndex={socialIndex}
              onBack={goBack}
              onNext={validateAndNext}
              onSkip={handoffToNativeForm}
            />
          )}

          {currentStep === "socialUrl" && (
            <SocialUrl
              control={form.control}
              socialIndex={socialIndex}
              onBack={() => setCurrentStep("socialPlatform")}
              onNext={validateAndNext}
            />
          )}

          {currentStep === "socialAddMore" && (
            <SocialAddMore
              onBack={() => setCurrentStep("socialUrl")}
              onAddAnother={addAnotherSocial}
              onNext={goNext}
              onSkip={handoffToNativeForm}
            />
          )}

          {currentStep === "allocIntro" && (
            <AllocationIntro
              onBack={goBack}
              onNext={() => setCurrentStep("allocName")}
            />
          )}

          {currentStep === "allocName" && (
            <AllocationName
              control={form.control}
              index={allocationIndex}
              onBack={() => setCurrentStep("allocIntro")}
              onNext={validateAndNext}
            />
          )}

          {currentStep === "allocSupply" && (
            <AllocationSupply
              control={form.control}
              index={allocationIndex}
              currentTotal={totalAllocationPercent}
              onBack={() => setCurrentStep("allocName")}
              onNext={validateAndNext}
            />
          )}

          {currentStep === "allocVesting" && (
            <AllocationVesting
              control={form.control}
              index={allocationIndex}
              onBack={() => setCurrentStep("allocSupply")}
              onNext={validateAndNext}
            />
          )}

          {currentStep === "allocStartDate" && (
            <AllocationStartDate
              control={form.control}
              index={allocationIndex}
              onBack={() => setCurrentStep("allocVesting")}
              onNext={validateAndNext}
            />
          )}

          {currentStep === "allocAddMore" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">
                  Add another allocation?
                </h3>
                <p className="text-sm text-muted-foreground mt-0">
                  Need another slice for Team, Presale, Community, or Investors?
                </p>
                <div className="text-sm mt-2">
                  <p
                    className={`font-semibold ${
                      totalAllocationPercent === 100
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    Total Allocation: {totalAllocationPercent}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-0">
                    You can continue when total allocation is exactly 100%.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setCurrentStep(
                      isSimpleAllocation ? "allocSupply" : "allocStartDate"
                    )
                  }
                >
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handoffToNativeForm}
                  >
                    Skip
                  </Button>
                  <Button
                    type="button"
                    disabled={totalAllocationPercent === 100}
                    variant="secondary"
                    onClick={() => {
                      const nextName = getNextDefaultAllocationName();
                      appendAllocation({
                        name: nextName,
                        supply: 0,
                        vesting: 0,
                        startDate: new Date().toISOString(),
                      } as any);
                      setAllocationIndex(allocationFields.length);
                      setCurrentStep("allocName");
                    }}
                  >
                    Yes, add another
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep("presaleUnit")}
                    disabled={totalAllocationPercent !== 100}
                  >
                    No, continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "allocTotal" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Total Allocation</h3>
                <p className="text-sm text-muted-foreground mt-0">
                  To continue, make sure total allocation equals exactly 100%.
                </p>
                <div className="text-sm mt-2">
                  <p
                    className={`font-semibold ${
                      totalAllocationPercent === 100
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    Total Allocation: {totalAllocationPercent}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("allocAddMore")}
                >
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    disabled={totalAllocationPercent === 100}
                    variant="secondary"
                    onClick={appendEmptyAllocationAndStart}
                  >
                    + Allocation
                  </Button>
                  <Button
                    type="button"
                    disabled={totalAllocationPercent !== 100}
                    onClick={goNext}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "presaleUnit" && (
            <PresaleUnit
              control={form.control}
              index={presaleIndex}
              units={tokenUnits}
              onBack={() => setCurrentStep("allocTotal")}
              onNext={async () => {
                const ok = await form.trigger([
                  `presales.${presaleIndex}.unit`,
                ] as any);
                if (!ok) return;
                goNext();
              }}
            />
          )}

          {currentStep === "presaleWhitelist" && (
            <>
              <PresaleWhitelist
                control={form.control}
                index={presaleIndex}
                show={showWhitelist}
                onToggle={setShowWhitelist}
                onBack={() => setCurrentStep("presaleUnit")}
                onNext={() => setShowConfirm(true)}
              />
            </>
          )}
        </form>
      </Form>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to proceed to the advanced form to finalize and
              submit your project. You can come back and review before
              submitting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirm(false);
                handoffToNativeForm();
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
