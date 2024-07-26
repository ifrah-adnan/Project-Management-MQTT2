import { db } from "@/lib/db";
import React from "react";
import Header from "./_component/header";
import Flow from "./_component/flow";

export default async function Page({
  params,
}: {
  params: {
    projectId: string;
  };
}) {
  const { projectId } = params;
  const data = await db.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      workFlow: {
        select: {
          id: true,
        },
      },
    },
  });

  return (
    <main className="w-full">
      <Header workflowId={data?.workFlow?.id || null} />
      <Flow />
    </main>
  );
}
