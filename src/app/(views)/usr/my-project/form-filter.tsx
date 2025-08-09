'use client'
import { FormSelect } from "@/components/form-select"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { useUpdateSearchParams } from "@/lib/param"
import { formFilterProjectSchema } from "@/modules/project/project.schema"
import { TFormFilterProject } from "@/types/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

export function FormFilter() {
  const updateParams = useUpdateSearchParams()
  const form = useForm<TFormFilterProject>({
    resolver: zodResolver(formFilterProjectSchema),
    defaultValues: {
      status: 'PENDING'
    }
  })
  async function onSubmit(values: TFormFilterProject) {
    updateParams({ status: values.status || '', page: 1 })
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Icon name="mdi:filter-outline" /> Filter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter</DialogTitle>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormSelect
                control={form.control}
                name="status"
                label="Select Status"
                placeholder="select status"
                groups={[
                  {
                    label: "Network",
                    options: [
                      { label: 'PENDING', value: 'PENDING' },
                      { label: 'APPROVED', value: 'APPROVED' },
                      { label: 'REJECTED', value: 'REJECTED' },
                      { label: 'DEPLOYED', value: 'DEPLOYED' },
                    ]
                  }
                ]}
              />
              <div className="mt-5 flex justify-end">
                <Button type="submit">Filter</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
