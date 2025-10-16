"use client";

import { FormInput } from "@/components/form-input";
import { FormSelect } from "@/components/form-select";
import { Icon } from "@/components/icon";
import { ImageDropzone } from "@/components/image-dropzone";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { converToIpfs, pinata } from "@/lib/pinata";
import { toUrlAsset } from "@/lib/utils";
import { useCategoryList } from "@/modules/category/category.query";
import { useChainList } from "@/modules/chain/chain.query";
import { useProjectTypeList } from "@/modules/project-types/project-types.query";
import { useCreateProject } from "@/modules/project/project.query";
import { formCreateProjectSchema } from "@/modules/project/project.schema";
import { useSocialList, useSocialName } from "@/modules/social/chain.query";
import { useStableCoinGroupList } from "@/modules/stable-coin/stable-coin.query";
import { useFormCreateProject } from "@/store/useFormCreateProject";
import { TFormProject, TFormProjectAllocation } from "@/types/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { defaultValues } from "./default-value";

export default function FormCreate() {
  const {
    form: formNewbie,
    logoFile,
    bannerFile,
    logoPreview,
    bannerPreview,
    reset: resetFormCreateProject,
  } = useFormCreateProject();
  const { data: email } = useSocialName("Email");
  const whitelistRef = useRef<HTMLDivElement>(null);
  const [showInputWL, setShowInputWL] = useState(false);
  const { mutate: createProject } = useCreateProject();
  const [logo, setLogo] = useState<File | null>(logoFile ?? null);
  const [banner, setBanner] = useState<File | null>(bannerFile ?? null);
  const [isFormReady, setIsFormReady] = useState(false);
  const { data: chains } = useChainList();
  const { data: categories } = useCategoryList();
  const { data: socials } = useSocialList();
  const { data: projectTypes } = useProjectTypeList();
  const { data: stableCoinGroup } = useStableCoinGroupList();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<TFormProject>({
    resolver: zodResolver(formCreateProjectSchema),
    defaultValues: defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (email && email.id) {
      form.reset({
        ...defaultValues,
        socials: [
          {
            socialId: email.id, // UUID dari DB
            url: "", // akan diisi user
          },
        ],
      });
    }
  }, [email, form]);

  useEffect(() => {
    try {
      if (!formNewbie || Object.keys(formNewbie || {}).length === 0) {
        setIsFormReady(true);
        return;
      }

      const safeNumber = (v: any, def = 0) =>
        v === undefined || v === null || v === "" ? def : Number(v);

      const normalized = {
        ...defaultValues,
        ...formNewbie,
        decimals:
          formNewbie.decimals !== undefined
            ? formNewbie.decimals
            : defaultValues.decimals,
        totalSupply:
          formNewbie.totalSupply !== undefined
            ? formNewbie.totalSupply
            : defaultValues.totalSupply,
        allocations: (formNewbie.allocations &&
        formNewbie.allocations.length > 0
          ? formNewbie.allocations
          : defaultValues.allocations
        ).map((a: any) => ({
          ...a,
          supply: safeNumber(a?.supply, 0),
          vesting: safeNumber(a?.vesting, 0),
          startDate: a?.startDate || new Date().toISOString(),
        })),
        socials:
          formNewbie.socials && formNewbie.socials.length > 0
            ? formNewbie.socials
            : defaultValues.socials,
      } as unknown as TFormProject;

      form.reset(normalized);

      if (normalized.chainId) {
        onChangeValue(String((normalized as any).chainId));
      }

      if (normalized.whitelistDuration) {
        setShowInputWL(normalized.whitelistDuration > 0);
        onCheckedChange(normalized.whitelistDuration > 0);
      }

      const wl = normalized.whitelistDuration as any;
      setShowInputWL(!!wl && Number(wl) > 0);

      setIsFormReady(true);
    } catch (error) {
      console.error("Error in useEffect:", error);
      setIsFormReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formNewbie, form]);

  useEffect(() => {
    try {
      const v =
        typeof window !== "undefined"
          ? localStorage.getItem("createProjectDraft")
          : null;
      if (v) {
        const parsed = JSON.parse(v);
        form.reset(parsed);
        localStorage.removeItem("createProjectDraft");
      }
    } catch {}
  }, [form]);

  useEffect(() => {
    if (chains && categories && projectTypes) {
      setIsFormReady(true);
    }
  }, [chains, categories, projectTypes]);

  const { fields, append, remove } = useFieldArray<TFormProjectAllocation>({
    control: form.control,
    name: "allocations",
  });

  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
  } = useFieldArray({
    control: form.control,
    name: "socials",
  });

  const allocations = form.watch("allocations");
  const socialsValues = form.watch("socials");
  const totalPercent = allocations.reduce(
    (sum: number, a: TFormProjectAllocation) => sum + Number(a.supply || 0),
    0
  );

  const getAvailableSocialPlatforms = (currentIndex: number) => {
    if (!socials) return [];

    const selectedSocialIds = socialsValues
      .map((social: { socialId: string; url: string }, index: number) =>
        index !== currentIndex ? social.socialId : null
      )
      .filter(Boolean);

    return socials.filter(
      (social) => !selectedSocialIds.includes(social.value)
    );
  };

  async function uploadLogo() {
    const urlRequest = await fetch("/api/upload");
    const urlResponse = await urlRequest.json();
    if (!logo) {
      alert("Upload image please!");
      return;
    }
    const upload = await pinata.upload.public.file(logo).url(urlResponse.url);
    const url = converToIpfs(upload.cid);
    return url;
  }

  async function uploadBanner() {
    const urlRequest = await fetch("/api/upload");
    const urlResponse = await urlRequest.json();
    if (!banner) {
      alert("Upload image please!");
      return;
    }
    const upload = await pinata.upload.public.file(banner).url(urlResponse.url);
    const url = converToIpfs(upload.cid);
    return url;
  }

  function onChangeValue(chainId: string) {
    const c = chains?.find((i) => i.value === chainId);
    const stabels = stableCoinGroup?.map((i) => {
      return {
        label: i.name,
        value: i.name,
      };
    });

    if (c && stabels) {
      const native = {
        label: c.ticker!,
        value: c.ticker!,
      };
      stabels.push(native);
      // setTokenUnits(stabels);
    }
  }

  function onCheckedChange(state: boolean) {
    setShowInputWL(state);
    if (state) {
      setTimeout(() => {
        whitelistRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  }

  async function onSubmit(values: TFormProject) {
    try {
      setLoading(true);
      let logoUrl, bannerUrl;
      const chainIds = values.chainId;
      if (logo) {
        logoUrl = await uploadLogo();
      }
      if (banner) {
        bannerUrl = await uploadBanner();
      }
      const allocations = values.allocations.map(
        (item: TFormProjectAllocation) => {
          return {
            ...item,
            isPresale: item.name.toLowerCase() === "presale",
          };
        }
      );
      const newValues = {
        ...values,
        whitelistAddress: undefined,
        sweepDuration: undefined,
        totalSupply: String(values.totalSupply),
        slug: Date.now().toString(),
        logo: logoUrl,
        banner: bannerUrl,
        chainIds: [chainIds],
        chainId: undefined,
        allocations,
      };
      createProject(newValues, {
        onSuccess: () => {
          resetFormCreateProject();

          router.push("/usr/my-project");
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save token");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="max-w-5xl mx-auto py-12 px-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-form-token-gradient p-4 md:p-8 rounded-2xl">
              <div className="mb-4">
                <h2>Complete Your Project</h2>
              </div>
              <div className="mb-6">
                <ImageDropzone
                  className="aspect-[12/4] bg-white dark:bg-slate-900"
                  externalPreview={bannerPreview ?? undefined}
                  onChange={(file) => setBanner(file)}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-44 h-44 shrink-0 mx-auto md:mx-0">
                  <ImageDropzone
                    className="aspect-square bg-white dark:bg-slate-900"
                    externalPreview={logoPreview ?? undefined}
                    onChange={(file) => setLogo(file)}
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <FormInput
                    control={form.control}
                    name="name"
                    label="Name"
                    placeholder="Enter name"
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormInput
                      control={form.control}
                      name="ticker"
                      label="Ticker"
                      placeholder="Enter ticker"
                    />
                    <FormInput
                      control={form.control}
                      name="decimals"
                      label="Decimal"
                      placeholder="Decimal"
                      type="number"
                    />
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-3 my-6">
                {isFormReady && chains && chains.length > 0 && (
                  <FormSelect
                    control={form.control}
                    name="chainId"
                    label="Select Chain"
                    placeholder="select chain"
                    onChangeValue={(val) => onChangeValue(val)}
                    groups={[
                      {
                        label: "Network",
                        options: chains.map((i) => {
                          return {
                            ...i,
                            iconUrl: i.logo && toUrlAsset(i.logo),
                          };
                        }),
                      },
                    ]}
                  />
                )}
                {isFormReady && categories && categories.length > 0 && (
                  <FormSelect
                    control={form.control}
                    name="categoryId"
                    label="Select Category"
                    placeholder="select category"
                    groups={[
                      {
                        label: "Category",
                        options: categories.map((i) => {
                          return {
                            ...i,
                            iconName: i.icon,
                          };
                        }),
                      },
                    ]}
                  />
                )}
                {isFormReady && projectTypes && projectTypes.length > 0 && (
                  <FormSelect
                    control={form.control}
                    name="projectTypeId"
                    label="Select Type"
                    placeholder="select type"
                    groups={[
                      {
                        label: "Project Type",
                        options: projectTypes.map((i) => {
                          return {
                            ...i,
                            iconName: i.icon,
                          };
                        }),
                      },
                    ]}
                  />
                )}
                {!isFormReady && (
                  <div className="col-span-2 p-4 text-center text-gray-500">
                    Loading form...
                  </div>
                )}
                <FormInput
                  control={form.control}
                  name="totalSupply"
                  label="Total Supply"
                  placeholder="Enter Supply"
                  type="number"
                  formatNumber={true}
                />
              </div>
              <FormInput
                control={form.control}
                name="detail"
                isLongText
                label="Description"
                placeholder="Enter Description"
              />
            </div>
            <div className="bg-form-token-gradient p-4 md:p-8 rounded-2xl">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">
                  Website / Social Media
                </h3>
                {socialFields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <FormSelect
                      className="w-56 shrink-0"
                      control={form.control}
                      name={`socials.${index}.socialId`}
                      label="Platform"
                      groups={[
                        {
                          label: "Social",
                          options: getAvailableSocialPlatforms(index).map(
                            (i) => {
                              return {
                                ...i,
                                iconName: i.icon,
                              };
                            }
                          ),
                        },
                      ]}
                      placeholder="Select platform"
                    />
                    <div className="flex-1">
                      <FormInput
                        control={form.control}
                        name={`socials.${index}.url`}
                        label="URL"
                        placeholder={
                          index === 0
                            ? "example@email.com"
                            : "https://example.com"
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => removeSocial(index)}
                    >
                      <Icon name="tabler:trash" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => appendSocial({ name: "", url: "" })}
                    variant="secondary"
                  >
                    + Add Social
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-form-token-gradient p-4 md:p-8 rounded-2xl">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Allocations</h3>
                <div>
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col md:flex-row gap-2 md:items-end space-y-2"
                    >
                      <div className="flex-1">
                        <FormInput
                          control={form.control}
                          name={`allocations.${index}.name`}
                          label={"Allocations"}
                          placeholder="e.g. Team"
                          disabled={
                            field.name === "Presale" ||
                            field.name === "Deployer"
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <FormInput
                          control={form.control}
                          name={`allocations.${index}.supply`}
                          label="Supply (%)"
                          placeholder="e.g. 1000"
                          type="number"
                        />
                      </div>
                      <div className="flex-1">
                        <FormInput
                          control={form.control}
                          name={`allocations.${index}.vesting`}
                          label="Lock Period (mo)"
                          placeholder="1"
                          type="number"
                          min={"1"}
                          disabled={
                            field.name === "Presale" ||
                            field.name === "Deployer"
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <FormInput
                          control={form.control}
                          name={`allocations.${index}.startDate`}
                          label="Start Date"
                          placeholder="e.g. 6"
                          type="date"
                          disabled={
                            field.name === "Presale" ||
                            field.name === "Deployer"
                          }
                          min={
                            new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
                              .toISOString()
                              .split("T")[0]
                          }
                        />
                      </div>
                      <Button
                        disabled={field.name === "Deployer"}
                        className="ms-auto"
                        size={"icon"}
                        type="button"
                        variant="destructive"
                        onClick={() => remove(index)}
                      >
                        <Icon name="tabler:trash" />
                      </Button>
                    </div>
                  ))}
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
                    <p className="text-xs font-semibold">
                      Total Allocation Must be 100%
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <Button
                  variant="secondary"
                  disabled={totalPercent >= 100}
                  type="button"
                  onClick={() =>
                    append({
                      allocation: "",
                      supply: 0,
                      start_date: "",
                      vesting: 0,
                    })
                  }
                >
                  + Allocation
                </Button>
              </div>
            </div>
            <div className="bg-form-token-gradient p-4 md:p-8 rounded-2xl">
              <div>
                <h3 className="text-lg font-semibold">Presale Info</h3>
                <div className="grid lg:grid-cols-3 gap-3">
                  <div ref={whitelistRef}>
                    <div className="flex items-center space-x-2 mt-4">
                      <Switch
                        onCheckedChange={onCheckedChange}
                        id="enable-whitelist"
                        checked={showInputWL}
                      />
                      <Label htmlFor="enable-whitelist">Enable Whitelist</Label>
                    </div>
                  </div>
                  {showInputWL && (
                    <FormInput
                      control={form.control}
                      name={`whitelistDuration`}
                      label="Duration (Hours)"
                      placeholder="Enter Dutaion"
                      type="number"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end sticky bottom-0 py-3 z-20 backdrop-blur">
              <Button
                onClick={() => router.back()}
                variant={"outline"}
                size={"lg"}
                type="button"
              >
                Cancel
              </Button>
              <Button
                disabled={totalPercent !== 100 || loading}
                size={"lg"}
                type="submit"
              >
                {loading && (
                  <Icon
                    name="mingcute:loading-3-fill"
                    className="animate-spin"
                  />
                )}
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
