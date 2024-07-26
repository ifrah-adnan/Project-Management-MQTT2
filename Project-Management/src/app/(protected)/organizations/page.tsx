import React from "react";
import ListO from "./_component/list";
import Header from "./_component/header";
import { OrganizationfindMany, getOrganizations } from "./_utils/action";
import { AdminComponent } from "../projects/_components/AdminComponent";

export default async function Organizations({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const result = await OrganizationfindMany(searchParams);
  return (
    <main className="flex flex-col">
      <>
        <Header />

        <AdminComponent {...result} />
      </>
    </main>
  );
}
