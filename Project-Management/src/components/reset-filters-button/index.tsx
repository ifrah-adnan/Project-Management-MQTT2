"use client";
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

interface ResetFiltersButtonProps extends ButtonProps {}
export default function ResetFiltersButton({
  onClick,
  ...props
}: ResetFiltersButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const resetFilters = () => {
    router.push(pathname);
  };
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    onClick && onClick(e);
    resetFilters();
  };
  return <Button onClick={handleClick} {...props} />;
}
