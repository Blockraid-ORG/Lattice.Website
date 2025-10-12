"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form-input";
import { FormSelect } from "@/components/form-select";
import { ImageDropzone } from "@/components/image-dropzone";
import { Icon } from "@/components/icon";
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
import { SocialMediaForm } from "./components/SocialSteps";
import { AllocationForm } from "./components/AllocationSteps";
import { PresaleUnit, PresaleWhitelist } from "./components/PresaleSteps";
import { useFormCreateProject } from "@/store/useFormCreateProject";
import { useStableCoinGroupList } from "@/modules/stable-coin/stable-coin.query";
import { TCommonOption } from "@/types/stable-coin";

export default function FormCreateNewbie() {
  const [currentStep, setCurrentStep] = useState<StepId>("intro");
  const [banner, setBanner] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [presaleIndex] = useState(0);
  const [showWhitelist, setShowWhitelist] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const { data: stableCoinGroup } = useStableCoinGroupList();

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
  const { fields: presalesFields } = useFieldArray({
    control: form.control,
    name: "presales",
  });
  const socialsValues = form.watch("socials");
  const selectedChainId = form.watch("chainId");
  const selectedChain = useMemo(
    () => chains?.find((c: any) => c.value === selectedChainId),
    [chains, selectedChainId]
  );
  const tokenUnits = useMemo<TCommonOption[]>(() => {
    const stabels = stableCoinGroup?.map((i: { name: string }) => {
      return {
        label: i.name,
        value: i.name,
      };
    });
    if (selectedChain) {
      const tokenUnitsTmp = [
        {
          label: `${selectedChain?.ticker ?? ""}`,
          value: `${selectedChain?.ticker ?? ""}`,
        },
        ...(stabels ?? []),
      ];
      return tokenUnitsTmp as TCommonOption[];
    }
    return stabels as TCommonOption[];
  }, [selectedChain, stableCoinGroup]);

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

  // Next Form Advanced
  const { setForm, setFormType, setMedia } = useFormCreateProject();

  function handoffToNativeForm() {
    const draft = form.getValues();
    setForm(draft);
    setFormType("advanced");

    // Create new URLs for global store to avoid memory leaks
    const logoPreview = logo ? URL.createObjectURL(logo) : null;
    const bannerPreview = banner ? URL.createObjectURL(banner) : null;

    setMedia({
      logoFile: logo,
      bannerFile: banner,
      logoPreview,
      bannerPreview,
    });
  }
  // END Next Form Advanced

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
                  A wide canvas that represents your project—show the mood, key
                  message, or campaign
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
                  A small mark that represents your project/brand
                  everywhere—clear and instantly recognizable.
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
                  Type your company or project name exactly as you want it shown
                  to users.
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
                  Enter 3 CAPITAL letters; the system adds the instrument type
                  automatically.
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
                  The smallest share unit (like kilo meter to meter which has 3
                  decimals). Common smallest share unit in web3 has 18 decimals.
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
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">Select Chain</h3>
                  <p className="text-sm text-muted-foreground mt-0">
                    Choose where your project runs:
                  </p>
                </div>
                <div className="grid gap-3">
                  <div className="p-4 border rounded-lg bg-card border-dashed">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">BNB (Mainnet)</h4>
                        <p className="text-xs text-muted-foreground">
                          fast, low fees, broad wallets.{" "}
                          <span className="italic">Regional</span>: strong
                          SEA/Asia. <span className="italic">Audience</span>:
                          retail-friendly; SMEs/startups.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card border-dashed">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">
                          Polygon (Mainnet)
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          very low fees, big EVM apps.{" "}
                          <span className="italic">Regional</span>: global,
                          strong India/Asia.{" "}
                          <span className="italic">Audience</span>: retail apps,
                          gaming, brand collabs.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card border-dashed">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">ETH (Mainnet)</h4>
                        <p className="text-xs text-muted-foreground">
                          most established, highest liquidity; higher fees.{" "}
                          <span className="italic">Regional</span>: global (deep
                          US/EU). <span className="italic">Audience</span>:
                          institution-friendly; major DeFi/custody.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card border-dashed">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm text-muted-foreground">
                          BSC Testnet
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          BNB Chain testnet for QA/demos;{" "}
                          <strong>no real funds</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {chains && (
                  <div className="space-y-2">
                    <FormSelect
                      control={form.control}
                      name="chainId"
                      label=""
                      placeholder="Choose a blockchain network..."
                      onChangeValue={() => {}}
                      groups={[
                        {
                          label: "Available Networks",
                          options: chains.map((i) => ({
                            ...i,
                            iconUrl: i.logo && toUrlAsset(i.logo),
                          })),
                        },
                      ]}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button type="button" variant="outline" onClick={goBack}>
                  <Icon name="tabler:arrow-left" className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handoffToNativeForm}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Skip
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
              <h3 className="text-xl font-semibold">Select Category</h3>
              <p className="text-sm text-muted-foreground mt-0">
                Pick the business category that best describes your project to
                help users find it.
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
          )}

          {currentStep === "projectTypeId" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Select Type</h3>
                <p className="text-sm text-muted-foreground mt-0">
                  Choose how you raise funds:
                </p>
              </div>

              <div className="grid gap-3">
                <div className="p-4 border rounded-lg bg-card border-dashed">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">Equity</h4>
                      <p className="text-xs text-muted-foreground">
                        you sell ownership (dilution); potential upside via
                        dividends/exit; may include governance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-card border-dashed">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">Debt</h4>
                      <p className="text-xs text-muted-foreground">
                        you borrow capital; coupon + principal schedule; no
                        dilution; may require collateral or covenants.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
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
                  {/* Enter total <strong>shares</strong> representing 100% of your
                  project (e.g.,
                  <strong>100,000,000</strong>); this defines all future splits. */}
                  Enter total <b>shares</b> for the project. RWA projects
                  benchmark have common total supply of 10,000,000,000
                </p>
                <FormInput
                  control={form.control}
                  name="totalSupply"
                  label=""
                  placeholder="e.g. 100000000"
                  formatNumber={true}
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
                  Write three short lines which covers your project background,
                  objective, and what&#39;s being tokenized.
                </p>
                <FormInput
                  control={form.control}
                  name="detail"
                  isLongText
                  label=""
                  placeholder="background, objective, what's being tokenized."
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
            <SocialMediaForm
              socialsOptions={
                socials
                  ? socials.map((i: any) => ({
                      ...i,
                      iconName: i.icon,
                    }))
                  : []
              }
              control={form.control}
              onBack={goBack}
              onNext={goNext}
              onSkip={handoffToNativeForm}
              socialsValues={socialsValues}
            />
          )}

          {currentStep === "allocIntro" && (
            <AllocationForm
              control={form.control}
              onBack={goBack}
              onNext={goNext}
              onSkip={handoffToNativeForm}
            />
          )}

          {currentStep === "presaleUnit" && (
            <PresaleUnit
              control={form.control}
              index={presaleIndex}
              units={tokenUnits}
              onBack={goBack}
              onNext={async () => {
                const ok = await form.trigger([
                  `presales.${presaleIndex}.unit`,
                ] as any);
                if (!ok) return;
                goNext();
              }}
              onSkip={handoffToNativeForm}
            />
          )}

          {currentStep === "presaleWhitelist" && (
            <>
              <PresaleWhitelist
                control={form.control}
                index={presaleIndex}
                show={showWhitelist}
                onToggle={setShowWhitelist}
                onBack={goBack}
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
