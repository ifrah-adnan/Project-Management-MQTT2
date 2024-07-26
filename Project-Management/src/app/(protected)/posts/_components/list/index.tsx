"use client";
import { TCreateInput, TData, TExpertise } from "../../_utils/schemas";
import { Table } from "@/components/table";
import { Card } from "@/components/ui/card";
import { ConfirmButton } from "@/components/confirm-button";
import { deleteById, handleDelete } from "../../_utils/actions";
import { CalendarIcon, Ellipsis, PencilIcon, Trash2Icon } from "lucide-react";
import { revalidatePath } from "next/cache";
import ParamsPagination from "@/components/params-pagination";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddEditPlanningButton } from "../add-planning-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { EditPostButton } from "../edit-post-button";
import UpdatePojectCount from "../update-project-count";
import { useSession } from "@/components/session-provider";
import { useEffect, useState } from "react";
import { getServerSession } from "@/lib/auth";
export default function List({ data, total }: { data: TData; total: number }) {
  const { session } = useSession();
  const user = session?.user;
  const [filteredData, setFilteredData] = useState<TData>([]);
  console.log(data);
  const [organizationId, setOrganizationId] = useState<any>("");

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

  return (
    <main className="p-6">
      <Card className="mx-auto flex h-full w-full max-w-screen-2xl flex-1  flex-col overflow-auto p-4 ">
        <Table>
          <thead>
            <tr>
              <th>name</th>
              <th>expertises</th>
              <th>
                <div className="flex gap-2">
                  <span>Planning</span>
                  <span className="font-medium text-gray-500">
                    {"(Operator / Project / Operation / Date)"}
                  </span>
                </div>
              </th>
              <th>date added</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => {
              const currentPlanning = item.plannings[0];
              const post = {
                id: item.id,
                name: item.name,
                expertises: item.expertises,
              };

              return (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>
                    {item.expertises.length > 0 ? (
                      <div className="max-w-[15rem] truncate">
                        {item.expertises.map((e) => e.name).join(", ")}
                      </div>
                    ) : (
                      <span className="text-gray-500">No expertises</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {(user.role === "ADMIN" || user.role === "SYS_ADMIN") && (
                        <AddEditPlanningButton
                          postId={item.id}
                          className="size-8 rounded-md"
                          variant={"outline"}
                          size={"icon"}
                          expertises={item.expertises}
                          onClose={() => console.log("Dialog closed")}
                        >
                          <CalendarIcon size={16} />
                        </AddEditPlanningButton>
                      )}

                      {item.plannings && item.plannings.length > 0 ? (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7 border-2 border-[#E6B3BA]">
                              <AvatarImage
                                src={item.plannings[0].operator.name || ""}
                                alt={item.plannings[0].operator.name}
                              />
                              <AvatarFallback className="font-bold">
                                {`${item.plannings[0].operator.name.charAt(0).toUpperCase()}`}
                              </AvatarFallback>
                            </Avatar>
                            <span className="capitalize">
                              {item.plannings[0].operator.name}
                            </span>
                            <span className="capitalize">
                              {item.plannings[0]?.commandProject.project.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{item.plannings[0]?.operation.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex gap-1">
                              <span className="text-gray-500">from</span>
                              <span>
                                {format(
                                  new Date(item.plannings[0].startDate),
                                  "PP",
                                )}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <span className="text-gray-500">to</span>
                              <span>
                                {format(
                                  new Date(item.plannings[0].endDate),
                                  "PP",
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          No planning for now
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center justify-between gap-4">
                      <span>{format(new Date(item.createdAt), "PP")}</span>
                      {(user.role === "ADMIN" || user.role === "SYS_ADMIN") && (
                        <Popover>
                          <PopoverTrigger>
                            <Ellipsis size={16} />
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            className="flex w-fit flex-col gap-2"
                          >
                            <EditPostButton
                              post={post}
                              variant="ghost"
                              className="justify-start gap-2 px-6 hover:text-sky-500"
                            >
                              <PencilIcon size={16} />
                              <span>Edit</span>
                            </EditPostButton>

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
          <ParamsPagination total={total} />
        </div>
      </Card>
    </main>
  );
}
