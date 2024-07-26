"use client";
import React from "react";
import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "outline" | "muted";
}

export default function index({
  className,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-lg  p-4",
        {
          "bg-card text-card-foreground shadow shadow-gray-500/10":
            variant === "default",
          "bg-transparent border border-card-foreground": variant === "outline",
          "bg-muted text-muted-foreground ": variant === "muted",
        },
        className
      )}
      // style={{
      //   boxShadow: "0px 2px  12px rgba(0, 0, 0, 0.1)",
      // }}
      {...props}
    />
  );
}
