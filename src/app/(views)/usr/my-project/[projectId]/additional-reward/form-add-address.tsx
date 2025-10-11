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
import { useDetailReward } from "@/modules/additional-rewards/additional-reward.query"
import { useAirdrop } from "@/modules/deploy/deploy.airdrop"
import { TAdditionalReward } from "@/types/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import z from "zod"

const itemSchema = z.object({
  address: z.string(),
  amount: z
    .coerce.number()
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: "Amount must be a positive number",
    }),
});

const formSchema = z.object({
  items: z.array(itemSchema).min(1, "At least one recipient is required"),
});

export type MultipleRecipientsFormValues = z.infer<typeof formSchema>;

const defaultRow = { address: "", amount: 0 };
export function FormAddress({ data }: { data: TAdditionalReward }) {
  const [open, setOpen] = useState(false)
  const [submitting, setIsSubmiting] = useState(false)
  const { setAllocations } = useAirdrop()
  const { data: detail} = useDetailReward(data.id)
  const form = useForm<MultipleRecipientsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { items: [defaultRow] },
    mode: "onChange",
  });

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const text = e.clipboardData.getData("text");
    const isBulk =
      text.includes("\n") || text.includes("\t") || text.includes(",");

    if (!isBulk) {
      return;
    }
    e.preventDefault();

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
            (existingItem) => existingItem.address === item.address
          )
      );

      if (uniqueParsed.length > 0) {
        form.setValue("items", [...existing, ...uniqueParsed], {
          shouldValidate: true,
        });
      }
    }
  }

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  function handleSubmit(values: MultipleRecipientsFormValues) {
    setIsSubmiting(true)
    setAllocations(values, data).finally(() => {
      setOpen(false)
      setIsSubmiting(false)
    });
  }
  function onOpenChange(open: boolean) { 
    setOpen(open);
    if (detail && detail.userAdditionalReward.length > 0) {
      const defaultItems = detail.userAdditionalReward.map((allocation) => ({
        address: allocation.address.toLowerCase(),
        amount: Number(allocation.amount)
      }));
      form.setValue("items", defaultItems, { shouldValidate: true });
    } else {
      form.setValue("items", [{ address: "", amount: 0 }], { shouldValidate: true });
    }
  }
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetTrigger asChild>
        <Button
          disabled={!data.contactAddress}
          size={'sm'}
        >
          <Plus /> Allocation
        </Button>
      </SheetTrigger>
      <SheetContent side={'bottom'} className="max-h-[90vh]">
        <SheetHeader className="container">
          <SheetTitle>Add Address</SheetTitle>
          <SheetDescription>
            Add address list eligible airdrop
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[70vh] overflow-auto container">
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
                      <div className="flex-1">
                        <FormInput
                          control={form.control}
                          name={`items.${idx}.amount`}
                          label=""
                          placeholder="e.g. 1000"
                          type="number"
                          formatNumber={true}
                        />
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
              <div className="flex items-center justify-start">
                <Button type="button" size={'sm'} onClick={() => append(defaultRow)}>
                  <Plus className="h-4 w-4" /> Add row
                </Button>
              </div>
              <Separator />
              <div className="flex gap-2 justify-end sticky bottom-0 py-4 backdrop-blur-lg">
                <Button type="button" variant="outline" onClick={() => form.reset({ items: [defaultRow] })}>Reset</Button>
                <Button type="submit" disabled={submitting}>
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
