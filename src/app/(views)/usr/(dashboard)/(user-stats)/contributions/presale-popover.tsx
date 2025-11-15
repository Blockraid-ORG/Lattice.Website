import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TPresaleOv } from "@/modules/user-overview/user-overview.service"

export function PresalePopover({ data }: { data: TPresaleOv[] }) {
  console.log({ data })
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={'icon-xs'} className="absolute top-0 right-0">
          <Icon className="text-xs" name="entypo:info" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="right">
        <div>
          <h4 className="leading-none font-medium">Presale Info</h4>
          <p className="text-muted-foreground text-sm">
            Your Detail Presale Info
          </p>
          {
            data.length && data?.map(item => (
              <div key={item.id} className="flex py-2 border-t mt-2 gap-2">
                <div className="w-6 h-6 shrink-0 bg-black rounded-full text-white flex items-center justify-center font-bold">{ item.presaleSCID }</div>
                <div className="flex flex-1 gap-2 font-semibold">
                  <div>{item.totalCount}</div>
                  <div className="font-light">{item.unit}</div>
                </div>
              </div>
            ))
          }
        </div>
      </PopoverContent>
    </Popover>
  )
}
