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
import { useDeployPresaleSC } from "@/modules/presales/presale.deploy"
import { TProject, TProjectPresaleWhitelistAddressItem } from "@/types/project"
import { Eye } from "lucide-react"
import { useEffect, useState } from "react"
export function WhitelistAddressList({ data }: { data: TProject }) {
  const [checkAllState, setcheckAllState] = useState<any>()
  const [items, setItems] = useState<TProjectPresaleWhitelistAddressItem[]>([])
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { removeFromWhitelist  } = useDeployPresaleSC()
  function onOpenChange(state: boolean) {
    if (state) {
      setItems(data.ProjectPresaleWhitelistAddress)
    }
    setOpen(state)
  }
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

  function handleRemoveAddress() {
    setSubmitting(true)
    const checkedData = items.filter(i => i.isChecked)
    const ids = checkedData.map(i => i.id)
    const walletAddress = checkedData.map(i => i.walletAddress)
    removeFromWhitelist(ids, walletAddress, data.whitelistsAddress!).finally(() => {
      setOpen(false)
      setSubmitting(false)
    })
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetTrigger asChild>
        <Button variant={'outline'}><Eye /> Whitelist</Button>
      </SheetTrigger>
      <SheetContent side={'bottom'} className="max-h-[90vh]">
        <SheetHeader className="container">
          <SheetTitle>Address</SheetTitle>
          <SheetDescription>
            Address whitelisted on <b>{data.name}</b>
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[70vh] overflow-auto container">
          <div className="my-4">
            {items.filter(i => i.isChecked).length > 0 && (
              <Button disabled={submitting} onClick={handleRemoveAddress} variant={'destructive'} className="flex gap-2">
                Delete {items.filter(i => i.isChecked).length} Selected
              </Button>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    className="rounded"
                    checked={checkAllState}
                    onCheckedChange={(val) => toggleSelectAll(Boolean(val))}
                  />
                </TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      className="rounded"
                      checked={item.isChecked}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono break-all">{item.walletAddress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
