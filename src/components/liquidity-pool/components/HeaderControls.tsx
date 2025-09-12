import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeaderControlsProps {
  resetForm: () => void;
}

export default function HeaderControls({ resetForm }: HeaderControlsProps) {
  return (
    <div className="flex items-center justify-end gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-3 text-xs"
        onClick={resetForm}
      >
        <Icon name="mdi:refresh" className="w-4 h-4 mr-1" />
        Reset
      </Button>

      <Select value="v3">
        <SelectTrigger className="h-8 w-auto px-3 text-xs">
          <SelectValue>v3 Position</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="v4" disabled>
            v4 Position
          </SelectItem>
          <SelectItem value="v3">v3 Position</SelectItem>
          <SelectItem value="v2" disabled>
            v2 Position
          </SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <Icon name="mdi:cog" className="w-4 h-4" />
      </Button>
    </div>
  );
}
