"use server";

import { db } from "@/lib/db";

export async function getOperationsHistory() {
  return await db.operationHistory.findMany({
    select: {
      id: true,
      planning: {
        select: {
          id: true,
          commandProject: {
            select: { id: true, project: { select: { id: true, name: true } } },
          },
          operation: { select: { id: true, name: true, isFinal: true } },
          operator: { select: { id: true, name: true } },
          post: { select: { id: true } },
        },
      },
      createdAt: true,
    },
  });
}
