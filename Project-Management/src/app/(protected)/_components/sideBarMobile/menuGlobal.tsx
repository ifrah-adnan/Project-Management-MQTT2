"use client";

import * as React from "react";
import { useRef } from "react";
import { motion, useCycle } from "framer-motion";
// import { Navigation } from "./navigate";;
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDimensions } from "@/hooks/use-dimensions";
import { MenuToggle } from "./menuToggle";
import { Navigation } from "./navigation";
import Logo from "@/components/logo";

export const MenuGlobal = () => {
  const [isOpen, toggleOpen] = useCycle(false, true);
  const containerRef = useRef(null);
  const { height } = useDimensions(containerRef);

  return (
    <motion.nav
      initial={false}
      className="flex  h-full  w-full items-center justify-between"
      animate={isOpen ? "open" : "closed"}
      custom={height}
      ref={containerRef}
    >
      <Navigation
        setOpen={toggleOpen}
        className={cn(
          "dark absolute left-0 top-[3.5rem]  z-40 flex  h-[calc(100vh-3.5rem)]    w-full flex-col   overflow-y-auto  bg-card  px-[2rem] py-[2rem] text-white shadow-md transition-all duration-300",
          {
            "translate-x-0": isOpen,
            "-translate-x-full": !isOpen,
          },
        )}
      />
      <MenuToggle toggle={() => toggleOpen()} />
      <Logo className="h-[3rem] w-[5rem] dark:fill-white" />
    </motion.nav>
  );
};
