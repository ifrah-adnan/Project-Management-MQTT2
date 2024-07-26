"use client";
import React, { useEffect, useState } from "react";
import { TData } from "../../_utils/schemas";
import { Table } from "@/components/table";
import { Card } from "@/components/ui/card";
import { ConfirmButton } from "@/components/confirm-button";
import { Ellipsis, PencilIcon, Trash2Icon } from "lucide-react";
import { revalidatePath } from "next/cache";
import ParamsPagination from "@/components/params-pagination";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { deleteById, handleDelete } from "../../_utils/actions";
import { EditUserButton } from "../edit-user-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "@/components/session-provider";

export default function List({
  data,
  total,
  userId,
}: {
  data: TData;
  total: number;
  userId: string;
}) {
  const { session } = useSession();
  const user = session?.user;
  const [filteredData, setFilteredData] = useState<TData>([]);
  const [organizationId, setOrganizationId] = useState<any>(null);

  useEffect(() => {
    if (session && session.user) {
      const orgId =
        session.user.organizationId || session.user.organization?.id;
      setOrganizationId(orgId);
    }
  }, [session]);

  useEffect(() => {
    if (organizationId && data.length > 0) {
      const filtered = data.filter(
        (item) => item.organizationId === organizationId,
      );
      setFilteredData(filtered);
    }
  }, [organizationId, data]);

  return (
    <div className="h-1 flex-1 p-4">
      <Card className="flex h-full flex-1 flex-col overflow-auto p-4">
        <Table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Rôle</th>
              <th>Email</th>
              <th>Expertises</th>
              <th>Date d Ajout</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7 border-2 border-[#E6B3BA]">
                      <AvatarImage src={item.image || ""} alt="@shadcn" />
                      <AvatarFallback className="font-bold">
                        {`${item.name.charAt(0).toUpperCase()}`}
                      </AvatarFallback>
                    </Avatar>
                    <span className="capitalize">{item.name}</span>
                  </div>
                </td>
                <td>{item.role}</td>
                <td>{item.email}</td>
                <td>
                  <div className="max-w-[15rem] truncate">
                    {item.expertises.length > 0 ? (
                      item.expertises.map((e) => e.name).join(", ")
                    ) : (
                      <span className="text-gray-500">No expertises</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex items-center justify-between gap-4">
                    <span>{format(new Date(item.createdAt), "PP p")}</span>
                    {(user.role === "ADMIN" || user.role === "SYS_ADMIN") && (
                      <Popover>
                        <PopoverTrigger>
                          <Ellipsis size={16} />
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          className="flex w-fit flex-col gap-2"
                        >
                          <EditUserButton
                            userData={item}
                            variant="ghost"
                            className="justify-start gap-2 bg-none px-6 hover:text-sky-500 "
                          >
                            <PencilIcon size={16} />
                            <span>Edit</span>
                          </EditUserButton>

                          <ConfirmButton
                            variant="ghost"
                            size="icon"
                            className=" flex w-full justify-start gap-2 rounded-md px-6 hover:text-red-500"
                            action={async () => {
                              await handleDelete(item.id);
                            }}
                          >
                            <Trash2Icon size={16} />
                            <span>Delete</span>
                          </ConfirmButton>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {filteredData.length === 0 && (
          <div className="grid flex-1 place-content-center">
            <span className=" text-center text-3xl font-semibold opacity-50">
              No Data
            </span>
          </div>
        )}
        <div className="mt-auto flex justify-end px-4 pb-4 pt-1">
          <ParamsPagination total={filteredData.length} />
        </div>
      </Card>
    </div>
  );
}
