import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { NumberComma } from "@/lib/utils"
import { useManageLocker } from "@/modules/manage-locker/manage-locker.hook"
import { TAllocation, TProject, TProjectAllocationAddress } from "@/types/project"
import dayjs from "dayjs"
import { Eye } from "lucide-react"
import { useEffect, useState } from "react"
export function LockerAddressList({ data, project }: { data: TAllocation, project:TProject }) {
  const { resetBeneficiaries } = useManageLocker()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [checkAllState, setcheckAllState] = useState<any>()
  const [items, setItems] = useState<TProjectAllocationAddress[]>([])
  const toggleSelect = (id: string) => {
    setItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, isChecked: !i.isChecked } : i
      )
    )
  }
  const toggleSelectAll = (checked: boolean) => {
    setItems(prev => prev.map(i => ({ ...i, isChecked: checked })))
  }
  function onOpenChange(state: boolean) {
    setOpen(state)
    if (state) {
      console.log(data,"DATA")
      setItems(data.addresses)
    }
  }
  useEffect(() => {
    const allChecked = items.length > 0 && items.every(i => i.isChecked)
    const someChecked = items.some(i => i.isChecked)
    if (allChecked) {
      setcheckAllState(true)
    }
    if (someChecked && !allChecked) {
      setcheckAllState('indeterminate')
    }
    if (!someChecked && !allChecked) {
      setcheckAllState(false)
    }
  }, [items])

  async function handleDeleteByIds() {
    const checkedData = items.filter(i => i.isChecked)
    const unchecked = items.filter(i => !i.isChecked).map(i => {
      return {
        amount: i.amount,
        address: i.address,
      }
    })
    const checkedIds = checkedData.map(i => i.id)
    setDeleting(true)
    resetBeneficiaries(
      checkedIds,
      project,
      unchecked,
      data,
    ).then(() => setOpen(false)).finally(() => setDeleting(false))
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetTrigger asChild>
        <Button variant={'ghost'} size={'xs'}><Eye /> View</Button>
      </SheetTrigger>
      <SheetContent side={'bottom'} className="max-h-[90vh]">
        <SheetHeader className="container">
          <SheetTitle>Address</SheetTitle>
          <SheetDescription>
            Beneficiary(ies) list who are eligible to claim from the <b>{data.name}</b> locked address. <br />
            Claims start on <b>{dayjs(data.startDate).add(2, "day").format('DD-MMM-YYYY')}</b> and continue over the next <b>{data.vesting}</b> months.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[70vh] overflow-auto container">
          <div className="mt-4">
            <div className="mb-4">
              {items.filter(i => i.isChecked).length > 0 && (
                <Button disabled={data.isFinalized || deleting} onClick={handleDeleteByIds} variant={'destructive'} className="flex gap-2">
                  Delete {items.filter(i => i.isChecked).length} Selected
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  {
                    !data.isFinalized && (
                      <TableHead className="w-[50px]">
                        <Checkbox
                          className="rounded"
                          checked={checkAllState}
                          disabled={data.isFinalized}
                          onCheckedChange={(val) => toggleSelectAll(Boolean(val))}
                        />
                      </TableHead>

                    )
                  }
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Claimable</TableHead>
                  <TableHead className="text-right">Claimed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    {
                      !data.isFinalized && (
                        <TableCell>
                          <Checkbox
                            className="rounded"
                            checked={item.isChecked}
                            onCheckedChange={() => toggleSelect(item.id)}
                          />
                        </TableCell>
                      )
                    }
                    <TableCell className="font-mono break-all">{item.address}</TableCell>
                    <TableCell className="text-right">{NumberComma(Number(item.amount))}</TableCell>
                    <TableCell className="text-right">{NumberComma(Number('0'))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
