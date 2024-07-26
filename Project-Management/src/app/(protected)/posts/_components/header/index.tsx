"use client";

import React from "react";
import { PlusIcon } from "lucide-react";
import { AddPostButton } from "../add-post-button";
import { useSession } from "@/components/session-provider";

export default function Header() {
  const { session } = useSession();
  const user = session?.user;

  return (
    <div className="font-sm flex h-page-header shrink-0 items-center justify-end gap-2 bg-card px-6 text-sm shadow">
      <h3 className="mr-auto font-medium capitalize">Posts</h3>
      {(user?.role === "ADMIN" || user?.role === "SYS_ADMIN") && (
        <AddPostButton className="gap-2 uppercase">
          <PlusIcon size={16} />
          <span>add new Post</span>
        </AddPostButton>
      )}
    </div>
  );
}
