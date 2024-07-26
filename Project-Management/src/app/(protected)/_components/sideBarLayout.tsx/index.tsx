"use client";
import { useMediaQuery } from "@/hooks/use-mediaQuery";
import React from "react";
import { SideBarMobile } from "../sideBarMobile";
import SideBar from "../sidebar";

function SideBarLayout() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  if (isMobile) {
    return <SideBarMobile />;
  }
  return <SideBar className="flex" />;
}

export default SideBarLayout;
