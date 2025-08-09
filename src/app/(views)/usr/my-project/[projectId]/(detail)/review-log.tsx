'use client'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TProjectReviewLog } from "@/types/project"
import dayjs from "dayjs"

export function ReviewLog({ data }: { data: TProjectReviewLog[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'outline'}>History Deployment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Review History</DialogTitle>
          <DialogDescription>
            Project review hostory!
          </DialogDescription>
        </DialogHeader>
        <div>
          <ScrollArea className="h-[60vh]">
            {
              data.length > 0 ? data?.map(item => (
                <div className="border-t py-2" key={item.id}>
                  <div>
                    <div className="text-xs font-bold">{item.status}</div>
                    <div className="text-sm">{item.note}</div>
                  </div>
                  <div className="text-xs">{dayjs(item.createdAt).format('MMM DD, YYYY HH:mm:ss')}</div>
                </div>
              )) : (
                <div className="flex items-center justify-center h-52">There is no data log!</div>
              )
            }
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
