import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { mn } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  fromDate?: Date;
}

export function DatePicker({
  id,
  value,
  onChange,
  label,
  placeholder = "Өдөр сонгох",
  fromDate,
}: DatePickerProps) {
  const date = value ? new Date(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            "w-full h-12 px-4 py-3.5 bg-muted/30 rounded-xl border border-border",
            "flex items-center gap-2 text-sm text-left",
            "hover:border-muted-foreground/30 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="w-4 h-4 shrink-0 opacity-50" />
          {date ? format(date, "yyyy-MM-dd") : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-xl" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => d && onChange(d.toISOString().split("T")[0])}
          fromDate={fromDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
