"use client";
import React, { useEffect, useState } from "react";
import { TData2 } from "../../_utils/schemas";
import { Table } from "@/components/table";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ConfirmButton } from "@/components/confirm-button";
import { deleteById, handleDelete } from "../../_utils/actions";
import { revalidatePath } from "next/cache";
import ParamsPagination from "@/components/params-pagination";
import { CalendarIcon, Ellipsis, PencilIcon, Trash2Icon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EditCommandButton } from "../edit-command-button";
import { useSession } from "@/components/session-provider";
export default function List({ data, total }: { data: TData2; total: number }) {
  const { session } = useSession();
  const user = session?.user;
  const [filteredData, setFilteredData] = useState<TData2>([]);

  useEffect(() => {
    if (user) {
      const filtered = data;
      setFilteredData(filtered);
    }
  }, [data, user]);

  return (
    <div className="h-1 flex-1 p-6">
      <Card className=" mx-auto flex h-full w-full max-w-screen-2xl flex-1 flex-col overflow-auto ">
        <Table>
          <thead>
            <tr>
              <th>reference</th>
              <th>client</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td>{item.reference}</td>
                <td>
                  {item.client ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6 border-2 border-[#E6B3BA]">
                        <AvatarImage
                          src={item.client?.image || ""}
                          alt={item.client?.name}
                        />
                        <AvatarFallback className="font-bold">
                          {`${item.client?.name.charAt(0).toUpperCase()}`}
                        </AvatarFallback>
                      </Avatar>
                      <span className="capitalize">{item.client?.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">
                      No client assigned
                    </span>
                  )}
                </td>
                <td>
                  <div className="flex items-center justify-between gap-4">
                    {/* <span>{format(new Date(item.deadline), "PP")}</span> */}
                    {(user.role === "ADMIN" || user.role === "SYS_ADMIN") && (
                      <Popover>
                        <PopoverTrigger>
                          <Ellipsis size={16} />
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          className="flex w-fit flex-col gap-2"
                        >
                          <EditCommandButton
                            variant="ghost"
                            commands={item}
                            className="justify-start gap-2 bg-none px-6 hover:text-sky-500 "
                          >
                            <PencilIcon size={16} />
                            <span>Edit</span>
                          </EditCommandButton>
                          <ConfirmButton
                            variant="ghost"
                            size="icon"
                            className=" flex w-full justify-start gap-2 rounded-md px-6 hover:text-red-500"
                            action={async () => {
                              await handleDelete(item.id, user.id);
                            }}
                          >
                            <Trash2Icon size={18} />
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
        {data.length === 0 && (
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
