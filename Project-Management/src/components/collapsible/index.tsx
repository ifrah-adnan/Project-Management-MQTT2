import React from "react";
import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CollapsibleProps extends HTMLMotionProps<"div"> {
  open: boolean;
}
export default function Collapsible({
  open,
  children,
  className,
  animate,
  ...props
}: CollapsibleProps) {
  return (
    <motion.div
      initial={false}
      animate={{ height: open ? "auto" : 0 }}
      className={cn("overflow-hidden", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
