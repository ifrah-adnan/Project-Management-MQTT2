import React from "react";
import { TData } from "../../_utils/schemas";
import { Table } from "@/components/table";
import { Card } from "@/components/ui/card";
import { ConfirmButton } from "@/components/confirm-button";
import { deleteById } from "../../_utils/actions";
import { GitBranchPlusIcon, Trash2Icon } from "lucide-react";
import { revalidatePath } from "next/cache";
import ParamsPagination from "@/components/params-pagination";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function List({ data, total }: { data: TData; total: number }) {
  return (
    <div className="h-1 flex-1 p-4">
      <Card className="mx-auto  flex h-full max-w-screen-2xl flex-1 flex-col overflow-auto p-4">
        <Table>
          <thead>
            <tr>
              <th>name</th>
              <th>status</th>
              <th>created at</th>
              <th>operations</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.status ? "Active" : "Inactive"}</td>
                <td>
                  <span>{format(new Date(item.createdAt), "PP")}</span>
                </td>
                <td className=" w-[15rem]">
                  <div className="flex items-center justify-between gap-4">
                    <Link href={`/projects/workflow/${item.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-fit gap-2 bg-card py-1 font-normal"
                      >
                        <GitBranchPlusIcon size={16} />
                        <span>View operations</span>
                      </Button>
                    </Link>
                    <ConfirmButton
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      action={async () => {
                        "use server";
                        await deleteById(item.id);
                        revalidatePath("/projects");
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
        {data.length === 0 && (
          <div className="grid flex-1 place-content-center">
            <span className=" text-center text-3xl font-semibold opacity-50">
              No Data
            </span>
          </div>
        )}
        <div className="mt-auto flex justify-end px-4 pb-4 pt-1">
          <ParamsPagination total={total} />
        </div>
      </Card>
    </div>
  );
}
