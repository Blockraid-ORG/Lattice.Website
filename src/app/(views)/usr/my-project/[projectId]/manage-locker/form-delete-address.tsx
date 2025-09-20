import { FormInput } from "@/components/form-input"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
// import { useDeleteProjectAllocationAddress } from "@/modules/project/project.query"
import { formBaseProjectAllocationSchema } from "@/modules/project/project.schema"
import { FormBaseProjectAllocationAddress, TAllocation, TProject } from "@/types/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

function buildFormSchema(maxSupplyPercent: number) {
  return formBaseProjectAllocationSchema.refine(
    (data) => data.items.reduce((sum, item) => sum + item.amount, 0) <= maxSupplyPercent,
    { message: `Total allocation cannot exceed ${maxSupplyPercent}%`, path: ["items"] }
  );
}
const defaultRow = { address: "", amount: 0 };
export function FormDeleteAddress({ allocation }: { data: TProject, allocation: TAllocation }) {
  // const { mutate: deleteProjectAllocationAddress } = useDeleteProjectAllocationAddress()
  const [open, setOpen] = useState(false)
  const [submitting, setIsSubmiting] = useState(false)
  const form = useForm<FormBaseProjectAllocationAddress>({
    resolver: zodResolver(buildFormSchema(100)),
    defaultValues: { items: [defaultRow] },
    mode: "onChange",
  });

  function handleSubmit(values: FormBaseProjectAllocationAddress) {
    console.log(values)
  }
  function onOpenChange(open: boolean) {
    setIsSubmiting(false)
    setOpen(open);
  }
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetTrigger asChild>
        <Button
          variant={'destructive'}
          size={'sm'}
          disabled={allocation.isFinalized}
        >
          <Trash /> Address
        </Button>
      </SheetTrigger>
      <SheetContent side={'bottom'} className="max-h-[90vh]">
        <SheetHeader className="container">
          <SheetTitle>Remove Address</SheetTitle>
          <SheetDescription>
            Remove address list from {allocation.name} Locker
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[70vh] overflow-auto container">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormInput
                control={form.control}
                name={`address`}
                label="Address"
                placeholder="0x85ae0e9D7bD898F9695736c1aF42fE0925516eA0,0x53c41d256b270BDFA4bB42FDdcCF7648e7a940A4,..."
                type="text"
                isLongText
              />
              <div className="flex gap-2 justify-end sticky bottom-0 backdrop-blur-lg">
                <Button variant={'destructive'} type="submit" disabled={submitting}>
                  {submitting ? "Deleting address..." : "Delete Address"}
                </Button>
              </div>
            </form>
          </Form>

        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
