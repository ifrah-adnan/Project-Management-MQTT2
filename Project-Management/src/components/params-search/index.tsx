"use client";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import React, { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface ParamsSearchProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  delay?: number;
  placeholder?: string;
}

export default function ParamsSearch({
  className,
  placeholder = "Search",
  delay = 500,
  ...props
}: ParamsSearchProps) {
  const router = useRouter();
  const query = useSearchParams();
  const pathname = usePathname();

  const search = query.get("search") || "";
  const [value, setValue] = React.useState(search);
  const firstRender = React.useRef(new Date().getTime());

  useEffect(() => {
    setValue(search);
  }, [search]);

  React.useEffect(() => {
    if (new Date().getTime() - firstRender.current < delay || value === search)
      return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(query.toString());
      params.set("search", value);
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  return (
    <div
      className={cn(
        "hidden lg:flex items-center gap-2 hover:shadow  has-[:focus]:shadow-lg transition-shadow relative bg-white rounded-lg py-1.5 px-3",
        className
      )}
      {...props}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border-none! peer w-[16rem] bg-transparent outline-none "
      />
      <SearchIcon
        size={18}
        className="text-foreground/50 peer-focus:text-primary"
      />
    </div>
  );
}
