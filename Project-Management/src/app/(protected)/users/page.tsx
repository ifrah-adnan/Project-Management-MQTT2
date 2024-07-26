import React from "react";
import Header from "./_components/header";
import { findMany } from "./_utils/actions";
import List from "./_components/list";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const result = await findMany(searchParams);
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  return (
    <main className="flex flex-col">
      <Header />
      <List {...result} userId={session.user.id} />
    </main>
  );
}
