"use client";
import React, { useEffect, useState } from "react";
import { TData } from "../../_utils/schemas";
import Card from "@/components/card";
import { Table } from "@/components/table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Ellipsis,
  FileClockIcon,
  GitBranchPlusIcon,
  PencilIcon,
  Settings2Icon,
  Trash2Icon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { statusMap } from "@/app/(protected)/_components/status-map";
import ConfigureSprintButton from "../configure-sprint-button";
import { ConfirmButton } from "@/components/confirm-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { handleDeleteCommandProject } from "../../_utils/actions";
import { EditProjectButton } from "../edit-project-button";
import { useSession } from "@/components/session-provider";
import { getServerSession } from "@/lib/auth";

export const ListView: React.FC<{ data: TData }> = ({ data }) => {
  const { session } = useSession();
  const user = session?.user;
  const [filteredData, setFilteredData] = useState<TData>([]);
  const [organizationId, setOrganizationId] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const serverSession = await getServerSession();
      setOrganizationId(
        serverSession?.user.organization?.id ||
          serverSession?.user.organizationId,
      );
    };

    fetchSession();
  }, []);

  useEffect(() => {
    if (organizationId) {
      const filtered = data.filter(
        (item) => item.organizationId === organizationId,
      );
      setFilteredData(filtered);
    }
  }, [data, organizationId]);

  return (
    <Card className="mx-auto h-full w-full max-w-screen-2xl overflow-auto p-4">
      <Table className="w-full">
        <thead>
          <tr>
            <th>project</th>
            <th>client</th>
            <th>done</th>
            <th>target</th>
            <th>sprints</th>
            <th>status</th>
            <th>deadline</th>
            <th>operations</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => {
            let totalSprints: number | undefined = undefined;
            let completedSprints: number | undefined = undefined;
            let done = 0;
            let sprints: undefined | string = undefined;
            if (item.sprint) {
              totalSprints = Math.ceil(item.target / item.sprint.target);
              completedSprints = Math.floor(done / item.sprint.target);
              sprints = `${completedSprints}/${totalSprints}`;
            }
            const client = item.command.client;
            return (
              <tr key={item.id}>
                <td>{item.project.name}</td>
                <td>
                  {client ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7 border-2 border-[#E6B3BA]">
                        <AvatarImage
                          src={client.image || ""}
                          alt={client.name}
                        />
                        <AvatarFallback className="font-bold">
                          {`${client.name.charAt(0).toUpperCase()}`}
                        </AvatarFallback>
                      </Avatar>
                      <span className="capitalize">
                        {item.command.client?.name}
                      </span>
                    </div>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>{item.done}</td>
                <td>{item.target}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn({
                        "text-gray-500": !sprints,
                      })}
                    ></span>
                    {sprints || "N/A"}
                    <ConfigureSprintButton
                      commandProjectId={item.id}
                      sprint={item.sprint}
                      maxTarget={item.target}
                      size="icon"
                      variant="ghost"
                      className="size-7"
                    >
                      <Settings2Icon size={16} />
                    </ConfigureSprintButton>
                  </div>
                </td>
                <td>{statusMap[item.status] || "N/A"}</td>
                <td>{format(new Date(item.endDate), "PP")}</td>

                <td className=" w-[12rem] shrink-0">
                  <Link href={`/projects/workflow/${item.project.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-fit gap-2 bg-card py-1 font-normal"
                    >
                      <GitBranchPlusIcon size={16} />
                      <span>View operations</span>
                    </Button>
                  </Link>
                </td>

                <td>
                  {(user.role === "ADMIN" || user.role === "SYS_ADMIN") && (
                    <Popover>
                      <PopoverTrigger>
                        <Ellipsis size={16} />
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className=" flex w-fit flex-col gap-2"
                      >
                        <EditProjectButton
                          project={item}
                          variant="ghost"
                          className=" justify-start gap-2   px-6  hover:text-sky-500 "
                        >
                          <PencilIcon size={16} />
                          <span>Edit</span>
                        </EditProjectButton>

                        <ConfirmButton
                          variant="ghost"
                          size="icon"
                          className=" flex w-full justify-start gap-2 rounded-md px-6 hover:text-red-500"
                          action={async () => {
                            await handleDeleteCommandProject(item.id);
                          }}
                        >
                          <Trash2Icon size={16} />
                          <span>Delete</span>
                        </ConfirmButton>
                      </PopoverContent>
                    </Popover>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
};
