import React from "react";
import ListH from "./_component";
import { getHistory } from "./_utils/action";
import { useSession } from "@/components/session-provider";
import { ActionType, EntityType } from "@prisma/client";

// Define the HistoryItem type
type HistoryItem = {
  id: string;
  userId: string;
  action: ActionType;
  entity: EntityType;
  entityId: string;
  details: string;
  createdAt: Date;
};

export default async function History() {
  const result = await getHistory();

  const filteredResult: HistoryItem[] = result.filter(
    (item): item is HistoryItem => item.entity !== null,
  );

  return <ListH data={filteredResult} />;
}
