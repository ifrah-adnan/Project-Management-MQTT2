"use client";

import { useSession } from "@/components/session-provider";
import { Table } from "@/components/table";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { handleDelete } from "../_utils/action";
import { ActionType, EntityType } from "@prisma/client";
import { Trash2Icon, ChevronDown } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type History = {
  id: string;
  userId: string;
  action: ActionType;
  details: string;
  createdAt: Date;
  entity: EntityType;
}[];

const actionTypes = ["All", "POST", "COMMAND", "EXPERTISE", "ORGANIZATION"];

function ListH({ data }: { data: History }) {
  const { session } = useSession();
  const user = session?.user;
  const [selectedAction, setSelectedAction] = useState("All");
  const [displayData, setDisplayData] = useState<History>([]);

  useEffect(() => {
    let filteredData = data.filter((history) => history.userId === user?.id);

    if (user?.role === "SYS_ADMIN") {
      // Filtrer uniquement les actions liées à l'organisation pour les sys admins
      filteredData = filteredData.filter(
        (history) => history.entity === EntityType.ORGANIZATION,
      );
    } else {
      // Exclure les actions liées à l'organisation pour les autres utilisateurs
      filteredData = filteredData.filter(
        (history) => history.entity !== EntityType.ORGANIZATION,
      );
    }

    if (selectedAction !== "All") {
      filteredData = filteredData.filter(
        (history) => history.entity === selectedAction,
      );
    }

    setDisplayData(filteredData);
  }, [selectedAction, data, user]);

  const availableActions =
    user?.role === "SYS_ADMIN"
      ? ["ORGANIZATION"]
      : actionTypes.filter((action) => action !== "ORGANIZATION");

  return (
    <main className="p-6">
      <Card className="mx-auto flex h-full w-full max-w-screen-2xl flex-1 flex-col overflow-auto p-4">
        <div className="mb-4 flex justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {selectedAction} <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableActions.map((action) => (
                <DropdownMenuItem
                  key={action}
                  onClick={() => setSelectedAction(action)}
                >
                  {action}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Details</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((history) => (
              <tr key={history.id}>
                <td>{history.action}</td>
                <td>{history.details}</td>
                <td>{history.createdAt.toLocaleString()}</td>
                <td>
                  <div className="flex items-center justify-between gap-4">
                    <div className="max-w-[20rem]"></div>
                    <ConfirmButton
                      variant="ghost"
                      size="icon"
                      className="flex w-full justify-start gap-2 rounded-md px-6 hover:text-red-500"
                      action={async () => {
                        await handleDelete(history.id);
                      }}
                    >
                      <Trash2Icon size={18} />
                    </ConfirmButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </main>
  );
}

export default ListH;
