"use client";

import React from "react";
import { PlusIcon } from "lucide-react";
import { AddProjectButton } from "../add-project-button";

export default function Header() {
  return (
    <div className="font-sm flex h-page-header shrink-0 items-center justify-end gap-2 bg-card px-6 text-sm shadow">
      <h3 className="mr-auto font-medium capitalize">products</h3>
      <AddProjectButton className="gap-2 uppercase">
        <PlusIcon size={16} />
        <span>add new product</span>
      </AddProjectButton>
    </div>
  );
}
