"use client";

import React from "react";
import { PlusIcon } from "lucide-react";
import { AddOrganizationButton } from "../add-organization-button";

export default function Header() {
  return (
    <div className="font-sm flex h-page-header shrink-0 items-center justify-end gap-2 bg-card px-6 text-sm shadow">
      <h3 className="mr-auto text-2xl font-bold capitalize underline ">
        Organizations
      </h3>
      <AddOrganizationButton className="gap-2 uppercase">
        <PlusIcon size={16} />
        <span>Create new Organization</span>
      </AddOrganizationButton>
    </div>
  );
}
