"use client";

import { useSession } from "@/components/session-provider";
import React, { useEffect, useState } from "react";
import { TData } from "../../_utils/schemas";
import { Table } from "@/components/table";
import { Card } from "@/components/ui/card";
import { ConfirmButton } from "@/components/confirm-button";
import { CalendarIcon, Ellipsis, PencilIcon, Trash2Icon } from "lucide-react";
import ParamsPagination from "@/components/params-pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EditExpertiseButton } from "../edit-expertise-button";
import { handleDelete } from "../../_utils/actions";
import { getServerSession } from "@/lib/auth";
export default function List({ data, total }: { data: TData; total: number }) {
  const { session } = useSession();
  const user = session?.user;
  const [filteredData, setFilteredData] = useState<TData>([]);
  const [organizationId, setOrganizationId] = useState<any>("");
  console.log(user);
  console.log(data);

  useEffect(() => {
    const fetchOrganizationImage = async () => {
      const serverSession = await getServerSession();
      const orgId =
        serverSession?.user.organizationId ||
        serverSession?.user.organization?.id;
      setOrganizationId(orgId);
    };

    fetchOrganizationImage();
  }, []);

  useEffect(() => {
    if (organizationId && data.length > 0) {
      const filtered = data.filter(
        (item) => item.organizationId === organizationId,
      );
      setFilteredData(filtered);
    }
  }, [organizationId, data]);

  console.log("filteredData", filteredData);
  return (
    <main className="p-6">
      <Card className="mx-auto flex h-full w-full max-w-screen-2xl flex-1 flex-col overflow-auto p-4">
        <Table>
          <thead>
            <tr>
              <th>name</th>
              <th>code</th>
              <th>operations</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.code}</td>
                <td>
                  <div className="flex items-center justify-between gap-4">
                    <div className="max-w-[20rem]">
                      {item.operations.map((op) => op.name).join(", ")}
                    </div>
                    {(user.role === "ADMIN" || user.role === "SYS_ADMIN") && (
                      <Popover>
                        <PopoverTrigger>
                          <Ellipsis size={16} />
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          className="flex w-fit flex-col gap-2"
                        >
                          <EditExpertiseButton
                            expertise={item}
                            variant="ghost"
                            className="justify-start gap-2 bg-none px-6 hover:text-sky-500 "
                          >
                            <PencilIcon size={16} />
                            <span>Edit</span>
                          </EditExpertiseButton>
                          <ConfirmButton
                            variant="ghost"
                            size="icon"
                            className="flex w-full justify-start gap-2 rounded-md px-6 hover:text-red-500"
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
            <span className="text-center text-3xl font-semibold opacity-50">
              No Data
            </span>
          </div>
        )}
        <div className="mt-auto flex justify-end px-4 pb-4 pt-1">
          <ParamsPagination total={total} />
        </div>
      </Card>
    </main>
  );
}
