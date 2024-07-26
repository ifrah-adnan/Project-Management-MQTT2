import React from "react";
import Header from "./_components/header";
import { findMany } from "./_utils/actions";
import List from "./_components/list";

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const result = await findMany(searchParams);

  return (
    <main className="flex flex-col">
      <Header />
      <List {...result} />
    </main>
  );
}
