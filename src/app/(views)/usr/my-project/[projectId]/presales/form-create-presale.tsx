import { Button } from '@/components/ui/button'
import { TFormProjectPresale, TProject } from '@/types/project'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { presalesSchema } from '@/modules/project/project.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInput } from '@/components/form-input'
import { Form } from '@/components/ui/form'
import { FormSelect } from '@/components/form-select'
import { presalesDurations } from '@/data/constants'
import { useCreateNewPresale } from '@/modules/presales/presale.query'
import { toast } from 'sonner'
import { useStableCoinGroup } from '@/modules/payment-method/payment-method.query'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toSeconds } from '@/lib/utils'
export default function FormCreatePresale({ data }: { data: TProject }) {
  const [showVesting, setShowVesting] = useState(false);
  const [units, setUnits] = useState<{ label: string, value: string }[]>([])
  const { data: stableGroups } = useStableCoinGroup()
  const [open, setOpen] = useState(false)
  const { mutate: createNewPresale } = useCreateNewPresale()
  const [submitting, setIsSubmiting] = useState(false)

  const form = useForm<TFormProjectPresale>({
    resolver: zodResolver(presalesSchema),
    defaultValues: {
      hardcap: '',
      price: '',
      unit: '',
      maxContribution: '',
      duration: '',
      startDate: '',
      endDate: '',
      claimTime: '',
      whitelistDuration: '',
      sweepDuration: '',
      initialReleaseBps: 100,
      cliffDuration: 0,
      vestingDuration: 0,
      unitTimeCliffDuration: 'day',
      unitTimeVestingDuration: 'day',
    },
    mode: "onChange",
  });

  async function onSubmit(values: TFormProjectPresale) {
    setIsSubmiting(true)
    const newValues = {
      unit: values.unit,
      maxContribution: values.maxContribution,
      duration: values.duration,
      startDate: values.startDate,
      endDate: values.endDate,
      claimTime: values.claimTime,
      whitelistDuration: data.whitelistDuration
        ? Number(data.whitelistDuration) * 3600
        : 0,
      sweepDuration: data.sweepDuration,
      whitelistAddress: data.whitelistsAddress,
      price: String(values.price),
      hardcap: String(values.hardcap),
      projectId: data.id,
      cliffDuration: toSeconds(values.cliffDuration, values.unitTimeCliffDuration),
      vestingDuration: toSeconds(values.vestingDuration, values.unitTimeVestingDuration),
      initialReleaseBps: values.initialReleaseBps * 100
    }
    createNewPresale(newValues, {
      onSuccess: () => {
        toast.success('Success', {
          description: 'success create presale'
        })
        setOpen(false)
        setIsSubmiting(false)
      }
    })
  }
  function onOpenChange(state: boolean) {
    setOpen(state)
    if (state) {
      const unitStables = stableGroups?.map(i => {
        return {
          value: i.name,
          label: i.name,
        }
      }) ?? []
      setUnits([
        {
          label: data.chains[0].chain.ticker,
          value: data.chains[0].chain.ticker,
        },
        ...unitStables
      ])
    }
  }
  function onCheckedChange(state: boolean) {
    setShowVesting(state)
    if (!state) {
      form.reset({
        ...form.getValues(),
        initialReleaseBps: 100,
        cliffDuration: 0,
        vestingDuration: 0,
        unitTimeCliffDuration: 'day',
        unitTimeVestingDuration: 'day',
      })
    }
  }
  
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button>Create Presale</Button>
      </DialogTrigger>
      <DialogContent className='max-w-6xl'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <DialogHeader>
              <DialogTitle>Form Create Presale</DialogTitle>
              <DialogDescription>
                Complete form to create new presale!
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className='h-[75vh]'>
              <div className='space-y-3 px-3'>
                <div className="grid md:grid-cols-3 gap-3">
                  {units && (
                    <div className="space-y-2">
                      <FormSelect
                        control={form.control}
                        name="unit"
                        label="Select Unit"
                        placeholder="Choose a unit..."
                        onChangeValue={() => { }}
                        groups={[
                          {
                            options: units
                          },
                        ]}
                      />
                      <p className='text-[11px]'>
                        Choose the token unit buyers will pay with.
                      </p>
                    </div>
                  )}
                  <div>
                    <FormInput
                      control={form.control}
                      name={`hardcap`}
                      label="Hard Cap"
                      placeholder="e.g. 100000"
                      formatNumber={true}
                    />
                    <p className='text-[11px]'>
                      Maximum funds you plan to raise (e.g., 100,000 USDC); sale stops when this limit is reached.
                    </p>
                  </div>
                  <div>
                    <FormInput
                      control={form.control}
                      name={`price`}
                      label="Price Per Token"
                      placeholder="e.g. 0.01"
                    />
                    <p className="text-[11px]">This sets how much buyers pay per share (e.g., 0.01 USDC/share).</p>
                  </div>
                  <div>
                    <FormInput
                      control={form.control}
                      name={`maxContribution`}
                      label="Max Contribution"
                      type="number"
                      placeholder="e.g. 500"
                    />
                    <p className="text-[11px]">buy limit per wallet (e.g., 500 USDC)</p>
                  </div>
                  <div>
                    <FormInput
                      control={form.control}
                      name={`startDate`}
                      label="Start Date (sale)" type="datetime-local"
                    />
                    <p className='text-[11px]'>When your presale begins, it automatically detects your timezone.</p>
                  </div>
                  <div>
                    <FormInput
                      control={form.control}
                      name={`endDate`}
                      label="End Date (sale)" type="datetime-local"
                    />
                    <p className='text-[11px]'>When your presale ending, it automatically detects your timezone.</p>
                  </div>
                  <div>
                    <FormSelect
                      control={form.control}
                      name={`claimTime`}
                      label="Claim Available After"
                      placeholder="select duration"
                      groups={presalesDurations ? [{
                        label: 'Duration',
                        options: presalesDurations ?? []
                      }] : []}
                    />
                    <p className='text-[11px]'>When buyers can claim their shares after sale ends.</p>
                  </div>
                </div>
              </div>
              <div className='mt-6 px-3'>
                <div className="flex items-center space-x-2 my-4">
                  <Switch
                    onCheckedChange={onCheckedChange}
                    id="enable-vesting"
                    checked={showVesting}
                  />
                  <Label htmlFor="enable-vesting">
                    Enable Vesting
                  </Label>
                </div>
                {
                  showVesting && (
                    <div className='space-y-3'>
                      <div className='grid md:grid-cols-2 gap-3'>
                        <div>
                          <FormInput
                            control={form.control}
                            name={`initialReleaseBps`}
                            label="Initial Release (%)"
                            placeholder="Enter Dutaion"
                            type="number"
                          />
                          <p className='text-[11px]'>
                            The first portion of tokens made available after the sale ends.
                          </p>
                        </div>
                      </div>
                      <div className='grid md:grid-cols-2 gap-3'>
                        <div>
                          <div className='flex gap-3'>
                            <div className="flex-1">
                              <div>
                                <FormInput
                                  control={form.control}
                                  name={`cliffDuration`}
                                  label="Cliff Duration"
                                  placeholder="Enter Dutaion"
                                  type="number"
                                />
                              </div>
                            </div>
                            <div className="w-1/4 shrink-0">
                              <FormSelect
                                control={form.control}
                                name={`unitTimeCliffDuration`}
                                label="Unit"
                                placeholder="select unit"
                                groups={[
                                  {
                                    options: [
                                      {
                                        label: 'Day',
                                        value: 'day'
                                      },
                                      {
                                        label: 'Month',
                                        value: 'month'
                                      },
                                    ]
                                  }
                                ]}
                              />
                            </div>
                          </div>
                          <p className='text-[11px]'>
                            The total time over which the remaining tokens gradually unlock after the cliff.
                          </p>
                        </div>
                        <div>
                          <div className='flex gap-3'>
                            <div className="flex-1">
                              <FormInput
                                control={form.control}
                                name={`vestingDuration`}
                                label="Vesting Duration"
                                placeholder="Enter Dutaion"
                                type="number"
                              />
                            </div>
                            <div className="w-1/4 shrink-0">
                              <FormSelect
                                control={form.control}
                                name={`unitTimeVestingDuration`}
                                label="Unit"
                                placeholder="select unit"
                                groups={[
                                  {
                                    options: [
                                      {
                                        label: 'Day',
                                        value: 'day'
                                      },
                                      {
                                        label: 'Month',
                                        value: 'month'
                                      },
                                    ]
                                  }
                                ]}
                              />
                            </div>
                          </div>
                          <p className='text-[11px]'>
                            The waiting period before any additional tokens start to unlock.
                          </p>
                        </div>
                        
                      </div>
                    </div>
                  )
                }
              </div>
            </ScrollArea>
            <DialogFooter>
              <DialogClose asChild>
                <Button disabled={submitting} variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Presale</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
