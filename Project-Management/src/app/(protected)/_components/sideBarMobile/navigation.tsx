import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Monitor } from "lucide-react";
import { FolderKanban } from "lucide-react";
import { SquareKanbanIcon } from "lucide-react";
import { ShoppingBasketIcon } from "lucide-react";
import { FolderClockIcon } from "lucide-react";
import { DockIcon } from "lucide-react";
import { UsersIcon } from "lucide-react";
import { BookTextIcon } from "lucide-react";
import { ScrollTextIcon } from "lucide-react";
import { SettingsIcon } from "lucide-react";
import { CircleHelpIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LinkItem } from "../sidebar";
import { useSession } from "@/components/session-provider";
import { usePathname } from "next/navigation";
import { useOrganizationNavigation } from "@/hooks/use-organizationNavigation";

const variants = {
  open: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2,
      staggerDirection: 1,
    },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

export const Navigation = ({
  className,
  setOpen,
}: {
  className?: string;
  setOpen?: any;
}) => {
  const { session } = useSession();
  const { user } = session;
  const pathname = usePathname();
  const navigateWithOrganization = useOrganizationNavigation();

  React.useEffect(() => {
    if (setOpen) {
      setOpen(false);
    }
  }, [pathname, setOpen]);
  return (
    <motion.div
      variants={variants}
      className={cn(
        "flex flex-col gap-2 [&>*]:text-2xl [&>*]:font-[600]",
        className,
      )}
    >
      <LinkItem
        href="/"
        icon={<Monitor size={18} />}
        onClick={() => navigateWithOrganization("/")}
      >
        dashboard
      </LinkItem>
      <LinkItem
        href="/projects"
        icon={<FolderKanban size={18} />}
        onClick={() => navigateWithOrganization("/projects")}
      >
        projects
      </LinkItem>
      <LinkItem
        href="/products"
        icon={<SquareKanbanIcon size={18} />}
        onClick={() => navigateWithOrganization("/products")}
      >
        products
      </LinkItem>
      <LinkItem
        href="/commands"
        icon={<ShoppingBasketIcon size={18} />}
        onClick={() => navigateWithOrganization("/commands")}
      >
        commands
      </LinkItem>
      <LinkItem
        href="/sprints"
        icon={<FolderClockIcon size={18} />}
        onClick={() => navigateWithOrganization("/sprints")}
      >
        sprints
      </LinkItem>
      <LinkItem
        href="/posts"
        icon={<DockIcon size={18} />}
        onClick={() => navigateWithOrganization("/posts")}
      >
        posts
      </LinkItem>
      <LinkItem
        href="/operators"
        icon={<UsersIcon size={18} />}
        onClick={() => navigateWithOrganization("/operators")}
      >
        operators
      </LinkItem>
      <LinkItem
        href="/expertise"
        icon={<BookTextIcon size={18} />}
        onClick={() => navigateWithOrganization("/expertise")}
      >
        operation Type
      </LinkItem>
      {/* <LinkItem href="/bom" icon={<ReceiptTextIcon size={18} />}>
          bom
        </LinkItem>
        <LinkItem href="/boa" icon={<ReceiptTextIcon size={18} />}>
          boa
        </LinkItem> */}
      <LinkItem
        href="/operations"
        icon={<ScrollTextIcon size={18} />}
        onClick={() => navigateWithOrganization("/operations")}
      >
        operations history
      </LinkItem>

      <LinkItem
        className="mt-auto"
        href="/settings"
        icon={<SettingsIcon size={18} />}
        onClick={() => navigateWithOrganization("/settings")}
      >
        settings
      </LinkItem>
      <LinkItem href="/help" icon={<CircleHelpIcon size={18} />}>
        help center
      </LinkItem>
      <div className="flex items-center gap-2  px-3 py-2">
        <Avatar className="size-12 border-2 border-[#E6B3BA]">
          <AvatarImage src={user.image || ""} alt="@shadcn" />
          <AvatarFallback className="font-bold">
            {`${user.name.charAt(0).toUpperCase()}`}
          </AvatarFallback>
        </Avatar>
        <div className=" flex-1">
          <div className="max-w-full truncate font-semibold capitalize">
            {user.name}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
