import React, { useEffect, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Input, InputProps } from "../ui/input";
import { cn } from "@/lib/utils";

interface DateInput extends InputProps {
  date?: Date;
  onValueChange?: (date: Date | undefined) => void;
}

export default function DateInput({
  className,
  onValueChange,
  ...props
}: DateInput) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onValueChange) onValueChange(date);
    const target = inputRef.current;
    if (!target) return;
    target.value = date ? format(date, "yyyy-MM-dd") : "";
  }, [date, onValueChange]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <div>
            <Input
              ref={inputRef}
              type="date"
              {...props}
              className={cn("pointer-events-none  ", className)}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-fit max-w-screen-md p-0 " align="start">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>
    </>
  );
}
