"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

const dateOptions = {
  today: "Today",
  yesterday: "Yesterday",
  last7days: "Last 7 days",
  last30days: "Last 30 days",
  thisMonth: "This month",
  lastMonth: "Last month",
};

interface DateSelectParamsProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DateSelectParams = ({
  className,
  ...props
}: DateSelectParamsProps) => {
  const router = useRouter();
  const query = useSearchParams();
  const pathname = usePathname();

  const date = query.get("date") || "today";
  const [value, setValue] = React.useState(date);
  React.useEffect(() => {
    const params = new URLSearchParams(query.toString());
    params.set("date", value);
    params.delete("from");
    params.delete("to");
    router.push(`${pathname}?${params.toString()}`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select a date" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(dateOptions).map(([key, value]) => (
          <SelectItem key={key} value={key}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
