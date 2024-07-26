"use client";
import React, { useEffect, useState } from "react";
import { TCreateInput, TData } from "../../_utils/schemas";
import { Table } from "@/components/table";
import { Card } from "@/components/ui/card";
import { ConfirmButton } from "@/components/confirm-button";
import { deleteById, handleDelete } from "../../_utils/actions";
import { CalendarIcon, Ellipsis, PencilIcon, Trash2Icon } from "lucide-react";
import { revalidatePath } from "next/cache";
import ParamsPagination from "@/components/params-pagination";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

import { useSession } from "@/components/session-provider";
export default function List({ data, total }: { data: TData; total: number }) {
  const { session } = useSession();
  const user = session?.user;
  const [filteredData, setFilteredData] = useState<TData>([]);

  useEffect(() => {
    if (user) {
      const filtered = data;
      setFilteredData(filtered);
    }
  }, [data, user]);

  return (
    <main className="p-6">
      <Card className="mx-auto flex h-full w-full max-w-screen-2xl flex-1  flex-col overflow-auto p-4 ">
        <Table>
          <thead>
            <tr>
              <th>Device id</th>
              <th>Post</th>
              <th>
                <div className="flex gap-2">
                  <span>Planning</span>
                  <span className="font-medium text-gray-500">
                    {"(Operator / Project / Operation / Date)"}
                  </span>
                </div>
              </th>
              <th>value</th>
              <th>date added</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => {
              return (
                <tr key={item.id}>
                  <td>{item.deviceId}</td>
                  <td>{item.post?.name}</td>
                  {item.planning && item.planning.endDate > new Date() ? (
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7 border-2 border-[#E6B3BA]">
                            <AvatarImage
                              src={item.planning?.operator.name || ""}
                              alt={item.planning?.operator.name}
                            />
                            <AvatarFallback className="font-bold">
                              {`${item.planning?.operator.name.charAt(0).toUpperCase()}`}
                            </AvatarFallback>
                          </Avatar>
                          <span className="capitalize">
                            {item.planning?.operator.name}
                          </span>
                          <span className="capitalize">
                            {item.planning?.commandProject.project.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{item.planning?.operation.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex gap-1">
                            <span className="text-gray-500">from</span>
                            <span>
                              {format(new Date(item.planning.startDate), "PP")}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <span className="text-gray-500">to</span>
                            <span>
                              {format(new Date(item.planning?.endDate), "PP")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <td>Add planning to this device in device configuration</td>
                  )}
                  <td>{item.count}</td>
                  <td>
                    <div className="  flex items-center justify-between gap-4">
                      <span>{format(new Date(item.createdAt), "PP")}</span>
                      {(user.role === "ADMIN" || user.role === "SYS_ADMIN") && (
                        <Popover>
                          <PopoverTrigger>
                            <Ellipsis size={16} />
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            className=" flex w-fit flex-col gap-2"
                          >
                            <ConfirmButton
                              variant="ghost"
                              size="icon"
                              className="flex w-full justify-start gap-2 rounded-md px-6 hover:text-red-500"
                              action={async () => {
                                await handleDelete(item.id, session.user.id);
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
              );
            })}
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
    </main>
  );
}
