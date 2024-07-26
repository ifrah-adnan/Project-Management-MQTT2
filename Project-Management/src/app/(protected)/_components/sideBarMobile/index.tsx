import { cn } from "@/lib/utils";
import Image from "next/image";
import { MenuGlobal } from "./menuGlobal";

interface SideBarMobileProps {
  className?: string;
}
export function SideBarMobile({
  className,
  ...props
}: SideBarMobileProps): JSX.Element {
  return (
    <nav
      className={cn(
        "dark sticky  top-0 z-50 flex h-[3.5rem] w-full items-center justify-between  gap-[4rem]  bg-card  px-4 shadow-md ",
      )}
      {...props}
    >
      <MenuGlobal />
    </nav>
  );
}
