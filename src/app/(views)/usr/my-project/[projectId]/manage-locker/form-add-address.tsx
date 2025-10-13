import { FormInput } from "@/components/form-input"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { cn, NumberComma } from "@/lib/utils"
import { useManageLocker } from "@/modules/manage-locker/manage-locker.hook"
import { formBaseProjectAllocationSchema } from "@/modules/project/project.schema"
import {
  FormBaseProjectAllocationAddress,
  FormProjectAllocationAddress,
  TAllocation,
  TProject
} from "@/types/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"

function buildFormSchema(maxSupplyPercent: number) {
  return formBaseProjectAllocationSchema.refine(
    (data) => data.items.reduce((sum, item) => sum + item.amount, 0) <= maxSupplyPercent,
    { message: `Total allocation cannot exceed ${maxSupplyPercent}%`, path: ["items"] }
  );
}
const defaultRow = { address: "", amount: 0 };
export function FormAddress({ data, allocation }: { data: TProject, allocation: TAllocation }) {
  const { setBeneficiaries} = useManageLocker()
  const [open, setOpen] = useState(false)
  const [submitting, setIsSubmiting] = useState(false)
  const form = useForm<FormBaseProjectAllocationAddress>({
    resolver: zodResolver(buildFormSchema(100)),
    defaultValues: { items: [defaultRow] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  function handleSubmit(values: FormBaseProjectAllocationAddress) {
    setIsSubmiting(true)
    const newValues = values.items.map((value: FormProjectAllocationAddress) => {
      return {
        ...value,
        amount: String((Number(data.totalSupply) * (allocation.supply / 100)) * (value.amount / 100))
      }
    })
    setBeneficiaries(newValues, allocation).then(() => {
      setOpen(false)
      setIsSubmiting(false)
    })
  }
  function onOpenChange(open: boolean) {
    setIsSubmiting(false)
    setOpen(open);
  }
  const items = form.watch("items") as FormProjectAllocationAddress[];
  const total = items.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    
    const text = e.clipboardData.getData("text");
    const isBulk =
      text.includes("\n") || text.includes("\t") || text.includes(",");

    if (!isBulk) {
      return;
    }
    // e.preventDefault();

    const rows = text
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);
    
    const parsed = rows
      .map((r) => {
        const [address, amount] = r.split(/\t|,/);
        return {
          address: address?.trim().toLowerCase() ?? "",
          amount: Number(amount?.trim() ?? 0),
        };
      })
      .filter((item) => item.address && item.amount > 0);

    if (parsed.length > 0) {
      let existing = form.getValues("items") ?? [];

      if (existing.length === 1 && !existing[0].address && !existing[0].amount) {
        existing = [];
      }

      const uniqueParsed = parsed.filter(
        (item) =>
          !existing.some(
            (existingItem:any) => existingItem.address === item.address
          )
      );

      if (uniqueParsed.length > 0) {
        form.setValue("items", [...existing, ...uniqueParsed], {
          shouldValidate: true,
        });
      }
    }
  }
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetTrigger asChild>
        <Button
          size={'sm'}
          disabled={allocation.isFinalized}
        >
          <Plus /> Address
        </Button>
      </SheetTrigger>
      <SheetContent side={'bottom'} className="max-h-[90vh]">
        <SheetHeader className="container">
          <SheetTitle>Add Address</SheetTitle>
          <SheetDescription>
            Add address list to {allocation.name} Locker
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[70vh] overflow-auto container">
          <div className="text-sm font-semibold mt-2">
            <div>Supply for {allocation.name}: {NumberComma(Number(data.totalSupply) * (allocation.supply / 100))}</div>
          </div>
          <Form {...form}>
            <div className="mb-3">
              <div className="flex justify-end">
                <Link className="text-blue-500 font-semibold underline text-sm" href="https://terravest-storage.s3.ap-southeast-1.amazonaws.com/templates/template_reward.xlsx" target="_blank" rel="noopener noreferrer">
                  Download Template
                </Link>
              </div>
            </div>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-1">
                {fields.map((field, idx) => (
                  <div key={field.id}>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <FormInput
                          control={form.control}
                          name={`items.${idx}.address`}
                          label=""
                          placeholder="0x..."
                          type="text"
                          onPaste={handlePaste}
                        />
                      </div>
                      <div className="w-1/6 shrink-0 flex items-center gap-1">
                        <FormInput
                          control={form.control}
                          name={`items.${idx}.amount`}
                          label=""
                          placeholder="e.g. 1000"
                          type="number"
                        />
                        <div className="mt-2"> %</div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(idx)} disabled={fields.length === 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className={cn(
                  'text-sm font-medium',
                  total !== 100 && 'text-destructive',
                  total === 100 && 'text-green-600',
                )}>
                  Total: {total}/100 %
                </div>
                <Button disabled={total >= 100} type="button" size={'sm'} onClick={() => append(defaultRow)}>
                  <Plus className="h-4 w-4" /> Add row
                </Button>
              </div>
              <Separator />
              <div className="flex gap-2 justify-end sticky bottom-0 py-4 backdrop-blur-lg">
                <Button type="button" variant="outline" onClick={() => form.reset({ items: [defaultRow] })}>Reset</Button>
                <Button type="submit" disabled={submitting || total !== 100}>
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </Form>

        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
