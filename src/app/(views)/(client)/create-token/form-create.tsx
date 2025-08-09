'use client'

import { FormInput } from "@/components/form-input"
import { FormSelect } from "@/components/form-select"
import { Icon } from "@/components/icon"
import { ImageDropzone } from "@/components/image-dropzone"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { presalesDurations, vestingCounts } from "@/data/constants"
import { converToIpfs, pinata } from "@/lib/pinata"
import { toUrlAsset } from "@/lib/utils"
import { useCategoryList } from "@/modules/category/category.query"
import { useChainList } from "@/modules/chain/chain.query"
import { useCreateProject } from "@/modules/project/project.query"
import { formCreateProjectSchema } from "@/modules/project/project.schema"
import { useSocialList } from "@/modules/social/chain.query"
import { TFormProject, TFormProjectAllocation, TFormProjectPresale } from "@/types/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { defaultValues } from "./default-value"
type TTokenUnit = {
  value: string
  label: string
}
export default function FormCreate() {
  const [tokenUnits, setTokenUtits] = useState<TTokenUnit[]>([])
  const { mutate: createProject } = useCreateProject()
  const [logo, setLogo] = useState<File | null>(null)
  const [banner, setBanner] = useState<File | null>(null)
  const { data: chains } = useChainList()
  const { data: categories } = useCategoryList()
  const { data: socials } = useSocialList()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const form = useForm<TFormProject>({
    resolver: zodResolver(formCreateProjectSchema),
    defaultValues: defaultValues
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "allocations"
  })

  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial
  } = useFieldArray({
    control: form.control,
    name: "socials"
  })
  const { fields: presalesFields } = useFieldArray({
    control: form.control,
    name: "presales"
  })
  const allocations = form.watch("allocations");
  const totalPercent = allocations.reduce((sum: number, a: TFormProjectAllocation) => sum + Number(a.supply || 0), 0)
  async function uploadLogo() {
    const urlRequest = await fetch("/api/upload");
    const urlResponse = await urlRequest.json();
    if (!logo) {
      alert('Upload image please!')
      return
    }
    const upload = await pinata.upload.public
      .file(logo)
      .url(urlResponse.url);
    const url = converToIpfs(upload.cid)
    return url;
  }
  async function uploadBanner() {
    const urlRequest = await fetch("/api/upload");
    const urlResponse = await urlRequest.json();
    if (!banner) {
      alert('Upload image please!')
      return
    }
    const upload = await pinata.upload.public
      .file(banner)
      .url(urlResponse.url);
    const url = converToIpfs(upload.cid)
    return url;
  }
  async function onSubmit(values: TFormProject) {
    setLoading(true)
    try {
      let logoUrl, bannerUrl;
      const chainIds = values.chainId;
      if (logo) {
        logoUrl = await uploadLogo()
      }
      if (banner) {
        bannerUrl = await uploadBanner()
      }
      const presales = values.presales.map((item: TFormProjectPresale) => {
        return {
          ...item,
          duration: Number(item.duration),
          hardcap: String(item.hardcap),
          price: String(item.price),
          maxContribution: String(item.maxContribution),
          chainId: chainIds,
        }
      })
      const allocations = values.allocations.map((item: TFormProjectAllocation) => {
        return {
          ...item,
          isPresale: (item.name).toLowerCase() === 'presale'
        }
      })
      const newValues = {
        ...values,
        totalSupply: String(values.totalSupply),
        slug: Date.now().toString(),
        logo: logoUrl,
        banner: bannerUrl,
        chainIds: [chainIds],
        chainId: undefined,
        presales: presales[0],
        allocations
      }
      createProject(newValues, {
        onSuccess: () => {
          router.push('/usr/my-project')
        }
      })
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to save token")
    } finally {
      setLoading(false)
    }
  }

  function onChangeValue(chainId: string) {
    const c = chains?.find(i => i.value === chainId)
    setTokenUtits([
      {
        label: `${c?.ticker}`,
        value: `${c?.ticker}`
      },
      {
        label: `USDC`,
        value: `USDC`
      },
      {
        label: `USDT`,
        value: `USDT`
      },
      
    ])
  }
  return (
    <div>
      <div className='max-w-4xl mx-auto py-12 px-3'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="text-sm mb-1">Banner</div>
              <ImageDropzone
                className='aspect-[12/4]'
                onChange={(file) => setBanner(file)}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-44 h-44 shrink-0 mx-auto md:mx-0">
                <ImageDropzone
                  className='aspect-square'
                  onChange={(file) => setLogo(file)}
                />
              </div>
              <div className='flex-1 space-y-4'>
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

            {
              chains && (
                <FormSelect
                  control={form.control}
                  name="chainId"
                  label="Select Chain"
                  placeholder="select chain"
                  onChangeValue={(val) => onChangeValue(val)}
                  groups={[
                    {
                      label: "Network",
                      options: chains.map(i => {
                        return {
                          ...i,
                          iconUrl: i.logo && toUrlAsset(i.logo)
                        }
                      })
                    }
                  ]}
                />

              )
            }
            {
              categories && (
                <FormSelect
                  control={form.control}
                  name="categoryId"
                  label="Select Category"
                  placeholder="select category"
                  groups={[{
                    label: 'Category',
                    options: categories.map(i => {
                      return {
                        ...i,
                        iconName: i.icon
                      }
                    })
                  }]}
                />

              )
            }
            <FormInput
              control={form.control}
              name="totalSupply"
              label="Total Supply"
              placeholder="Enter Supply"
            />
            <FormInput
              control={form.control}
              name="detail"
              isLongText
              label="Description"
              placeholder="Enter Description"
            />
            <div className='bg-white border dark:bg-primary-foreground/50 p-4 rounded-lg mb-12'>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Website / Social Media</h3>
                {socialFields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <FormSelect
                      className="w-56 shrink-0"
                      control={form.control}
                      name={`socials.${index}.socialId`}
                      label="Platform"
                      groups={[{
                        label: 'Social',
                        options: socials ? socials.map(i => {
                          return {
                            ...i,
                            iconName: i.icon
                          }
                        }) : []
                      }]}
                      placeholder="Select platform"
                    />
                    <div className="flex-1">
                      <FormInput
                        control={form.control}
                        name={`socials.${index}.url`}
                        label="URL"
                        placeholder={`https://...`}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeSocial(index)}
                    >
                      <Icon name='tabler:trash' />
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
            <div className='bg-white border dark:bg-primary-foreground/50 p-4 rounded-lg'>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Allocations</h3>
                <div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col md:flex-row gap-2 md:items-end space-y-2">
                      <div className="flex-1">
                        <FormInput
                          control={form.control}
                          name={`allocations.${index}.name`}
                          label="Allocation"
                          placeholder="e.g. Team"
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
                        {/* <FormInput
                          control={form.control}
                          name={`allocations.${index}.vesting`}
                          label="Vesting (mo)"
                          placeholder="e.g. 6"
                          type="number"
                        /> */}
                        <FormSelect
                          control={form.control}
                          name={`allocations.${index}.vesting`}
                          label="Vesting (mo)"
                          placeholder="select vesting"
                          groups={vestingCounts ? [{
                            label: 'Vesting',
                            options: vestingCounts ?? []
                          }] : []}
                        />
                      </div>
                      <div className="flex-1">
                        <FormInput
                          control={form.control}
                          name={`allocations.${index}.startDate`}
                          label="Start Date"
                          placeholder="e.g. 6"
                          type="date"
                        />
                      </div>
                      <Button disabled={index < 1} className='ms-auto' size={"icon"} type="button" variant="destructive" onClick={() => remove(index)}>
                        <Icon name='tabler:trash' />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <p className={`text-xs font-semibold ${totalPercent !== 100 ? 'text-red-500' : 'text-green-600'}`}>
                    Total Allocation: {totalPercent}%
                  </p>
                  {totalPercent !== 100 && <p className='text-xs font-semibold'>Total Allocation Must be 100%</p>}
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <Button variant="secondary" disabled={totalPercent >= 100} type="button" onClick={() => append({ allocation: "", supply: 0, start_date: "", vesting: 0 })}>
                  + Allocation
                </Button>
              </div>
            </div>
            <div className='bg-white border dark:bg-primary-foreground/50 p-4 rounded-lg'>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Presales Info</h3>
                <div>
                  {presalesFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-3 gap-3">
                      <FormInput
                        control={form.control}
                        name={`presales.${index}.hardcap`}
                        label="Hard Cap"
                        placeholder="e.g. 100000"
                      />
                      <FormInput
                        control={form.control}
                        name={`presales.${index}.price`}
                        label="Price Per Token"
                        placeholder="e.g. 0.01"
                      />
                      <FormSelect
                        control={form.control}
                        name={`presales.${index}.unit`}
                        label="Unit"
                        placeholder="e.g.USDT"
                        groups={tokenUnits ? [{
                          label: 'Unit',
                          options: tokenUnits ?? []
                        }] : []}
                      />
                      <FormInput
                        control={form.control}
                        name={`presales.${index}.maxContribution`}
                        label="Max Contribution"
                        type="number"
                        placeholder="e.g. 500"
                      />
                      {/* <FormInput
                        control={form.control}
                        name={`presales.${index}.duration`}
                        label="Duration" type="datetime-local"
                      /> */}
                      <FormSelect
                        control={form.control}
                        name={`presales.${index}.duration`}
                        label="Claim Available After"
                        placeholder="select duration"
                        groups={presalesDurations ? [{
                          label: 'Duration',
                          options: presalesDurations ?? []
                        }] : []}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end sticky bottom-0 py-3 z-20 backdrop-blur border-t">
              <Button onClick={() => router.back()} variant={"outline"} size={"lg"} type="button">Cancel</Button>
              <Button disabled={
                totalPercent !== 100 || loading
              } size={"lg"} type="submit">
                {loading && <Icon name='mingcute:loading-3-fill' className='animate-spin' />}
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
