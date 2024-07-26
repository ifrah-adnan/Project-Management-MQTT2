"use client";

import { useSession } from "@/components/session-provider";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { LogOutIcon } from "lucide-react";

interface NavbarProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "children"> {}

export default function Navbar({ className, ...props }: NavbarProps) {
  const { session } = useSession();
  const { user } = session;
  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <nav
      className={cn(
        "  flex h-12  px-4 gap-4 items-center justify-end  bg-blur ",
        className
      )}
      {...props}
    >
      <span className="font-bold mr-auto">LOGO</span>
      <span>{user.name}</span>
      <Button
        variant={"outline"}
        size="sm"
        onClick={handleLogout}
        className="flex items-center gap-2"
      >
        <LogOutIcon size={16} />
        <span>Sign Out</span>
      </Button>
    </nav>
  );
}
