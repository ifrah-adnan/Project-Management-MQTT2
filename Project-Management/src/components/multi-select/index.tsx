"use client";
import { useState, useRef, ElementRef } from "react";
import { twMerge } from "tailwind-merge";
import { DeleteIcon, XIcon } from "lucide-react";
import { useOnClickOutside } from "usehooks-ts";
import { Button } from "../ui/button";

type OptionProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children">;

export interface TagSelectProps<T>
  extends React.HTMLAttributes<HTMLDivElement> {
  options: T[];
  value: T[];
  onValueChange: (value: T[]) => void;
  optionProps?: OptionProps;
  optionRenderer: (option: T) => React.ReactNode;
  valueRenderer: (value: T) => React.ReactNode;
}

export function MultiSelect<T>({
  options,
  valueRenderer,
  optionRenderer,
  value,
  className,
  onValueChange,
  title,
  ...props
}: TagSelectProps<T> & { title?: string }) {
  const [showOptions, setShowOptions] = useState(false);
  const inputRef = useRef<ElementRef<"input">>(null);
  const containerRef = useRef<ElementRef<"div">>(null);

  useOnClickOutside(containerRef, () => {
    setShowOptions(false);
  });

  return (
    <div
      ref={containerRef}
      {...props}
      className={twMerge(
        " relative  flex h-fit min-h-[2rem] flex-wrap   items-center gap-2 rounded-md border  bg-white dark:bg-slate-800 p-3  dark:border-gray-800 dark:text-gray-300",
        className
      )}
      onClick={() => {
        inputRef.current?.focus();
        setShowOptions(true);
      }}
    >
      <input hidden />
      {value.length > 0 ? (
        value.map((item, index) => (
          <div
            key={index}
            className="pl-2 py-0 rounded-full flex justify-between gap-1  bg-gray-500 text-white text-xs  items-center "
          >
            <span className="text-sm">{valueRenderer(item)}</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-7 hover:bg-white/20 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onValueChange(value.filter((_, i) => i !== index));
              }}
            >
              <XIcon size={16} />
            </Button>
          </div>
        ))
      ) : (
        <span className="text-gray-500">{title ? title : "Select"}</span>
      )}
      <div
        className={twMerge(
          "absolute inset-x-0 z-[99] top-[calc(100%+4px)] hidden max-h-96 flex-col overflow-auto rounded border bg-white   dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300",
          showOptions && "flex"
        )}
      >
        {options.length > 0 ? (
          options.map((option, index) => (
            <span
              className="hover flex cursor-pointer items-center px-2 py-1 hover:bg-gray-700/10"
              key={index}
              onClick={() => {
                if (value.includes(option))
                  onValueChange(value.filter((v) => v !== option));
                else onValueChange([...value, option]);
              }}
            >
              <span>{optionRenderer(option)}</span>
              {
                <span className="flex-1 text-right text-xl text-gray-500">
                  {value.includes(option) ? "✓" : ""}
                </span>
              }
            </span>
          ))
        ) : (
          <span className="px-2 py-1 text-center text-gray-500">
            No options
          </span>
        )}
      </div>
    </div>
  );
}
