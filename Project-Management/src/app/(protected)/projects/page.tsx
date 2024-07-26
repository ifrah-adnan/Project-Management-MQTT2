"use client";
import React, { useState, useEffect } from "react";
import Header from "./_components/header";
import { findMany } from "./_utils/actions";
import List from "./_components/list";
import { useSession } from "@/components/session-provider";
import { TData } from "./_utils/schemas";
import { AdminComponent } from "./_components/AdminComponent";
import { OrganizationfindMany } from "../organizations/_utils/action";
import HeaderAdmin from "./_components/HeaderAdmin";
type ResultState = null | {
  data: TData;
  total: number;
};
type TDataO = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  imagePath: string | null;
  address: string | null;
  users: {
    id: string;
    name: string;
    email: string;
  }[];
}[];
type OrganizationType = {
  data: TDataO;
  total: number;
};

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const [result, setResult] = useState<ResultState>(null);
  const [resultO, setResultO] = useState<OrganizationType>();

  const { session } = useSession();
  const user = session?.user;

  useEffect(() => {
    const fetchData = async () => {
      const data = await findMany(searchParams);
      setResult(data);
      const dataO = await OrganizationfindMany(searchParams);
      setResultO(dataO);
    };
    fetchData();
  }, [searchParams]);

  if (!result) {
    return <div>Loading...</div>;
  }
  if (!resultO) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex flex-col">
      <>
        <Header />
        <List {...result} />
      </>
    </main>
  );
}
