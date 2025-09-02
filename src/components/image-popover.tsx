import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Image from "next/image";
type ImagePopoverPopover = {
  src: string;
  classImage?: string;
  className?: string;
};
export default function ImagePopover(props: ImagePopoverPopover) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Image
          className={cn("cursor-pointer", props.className)}
          width={25}
          height={25}
          alt="image"
          src={props.src}
        />
      </PopoverTrigger>
      <PopoverContent>
        <div className="h-auto w-auto">
          <Image
            onLoadingComplete={() => "sudah ok"}
            width={512}
            height={512}
            className={cn("w-full h-full object-contain", props.classImage)}
            alt="image"
            src={props.src}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
