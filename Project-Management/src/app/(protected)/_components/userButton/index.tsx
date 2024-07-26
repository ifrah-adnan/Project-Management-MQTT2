import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/components/session-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { CogIcon, HistoryIcon, LogOut, UserRoundCogIcon } from "lucide-react";
import { useRouter } from "next/router"; // Import useRouter
import Link from "next/link";

function UserButton({ className }: { className?: string }) {
  const { session } = useSession();
  const { user } = session;
  const [firstName] = (user?.name || "").split(" ");

  return (
    <div className={cn("flex items-center gap-1  text-foreground", className)}>
      <Popover>
        <PopoverTrigger>
          {" "}
          <Avatar className="size-6 border-2 border-[#E6B3BA]">
            <AvatarImage src={user.image || ""} alt="@shadcn" />
            <AvatarFallback className="font-bold">
              {`${user.name.charAt(0).toUpperCase()}`}
            </AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent className=" mr-2 flex max-w-[18rem] flex-col  justify-center gap-4 py-6">
          <div className="flex gap-2">
            <Avatar className="size-12 border-2 border-[#E6B3BA]">
              <AvatarImage src={user.image || ""} alt={user.name} />
              <AvatarFallback className="font-bold">
                {`${user.name.charAt(0).toUpperCase()}`}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="text-base capitalize">{user.name}</div>
              <div className="max-w-[12.5rem] truncate text-xs opacity-60">
                {user.email}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              className="items-center justify-start gap-2"
              variant="ghost"
            >
              <UserRoundCogIcon size={18} />
              <span>Update Profile</span>
            </Button>
            <Link href="/History">
              <Button
                className="flex items-center justify-start gap-2"
                variant="ghost"
              >
                <HistoryIcon size={18} />
                <span>History</span>
              </Button>
            </Link>
            <form action={logout} className="">
              <Button
                className="w-full items-center justify-start gap-2"
                variant="ghost"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </Button>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default UserButton;
