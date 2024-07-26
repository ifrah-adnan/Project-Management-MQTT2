"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  data: {
    name: string;
    image: string | null;
  }[];
  max?: number;
}

export default function AvatarGroup({
  data,
  max = 4,
  className,
}: AvatarGroupProps) {
  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {data
        .slice(0, data.length === max ? max : max - 1)
        .map(({ name, image }, index) => (
          <Avatar key={index} className="size-7 border-2 border-primary">
            <AvatarImage src={image || ""} alt="@shadcn" />
            <AvatarFallback className="font-bold">
              {`${name.charAt(0).toUpperCase()}`}
            </AvatarFallback>
          </Avatar>
        ))}
      {max < data.length && (
        <div className="text-white grid place-content-center  size-7 z-10 p-1 min-w-fit rounded-full font-bold bg-primary">{`${data.length - max}+`}</div>
      )}
    </div>
  );
}
