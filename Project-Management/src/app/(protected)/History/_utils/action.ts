"use server";
import { db } from "@/lib/db";
import { ActionType, EntityType } from "@prisma/client";
import { History } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function logHistory(
  action: ActionType,
  details: string,
  entity: EntityType,
  entityId: string,
  userId: any,
): Promise<void> {
  await db.history.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      details,
    },
  });
}
export async function getHistory(): Promise<History[]> {
  return await db.history.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}
export async function deleteById(id: string) {
  await db.history.delete({ where: { id } });
}

export async function handleDelete(id: string) {
  await deleteById(id);
  revalidatePath("/History");
}
