"use client";
import React, { useEffect, useState } from "react";
import { TData } from "../../_utils/schemas";
import Card from "@/components/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Ellipsis,
  ListChecksIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { statusMap } from "@/app/(protected)/_components/status-map";
import { CircularProgress } from "@/components/circular-progress";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EditProjectButton } from "../edit-project-button";
import { ConfirmButton } from "@/components/confirm-button";
import { handleDeleteCommandProject } from "../../_utils/actions";
import ConfigureSprintButton from "../configure-sprint-button";
import { getServerSession } from "@/lib/auth";

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const GridView: React.FC<{ data: TData }> = ({ data }) => {
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
    <main>
      <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-4 text-sm">
        {filteredData.map((item) => {
          const client = item.command.client;
          const value = (item.done / item.target) * 100;
          let totalSprints: number | undefined = undefined;
          let completedSprints: number | undefined = undefined;
          let sprints: undefined | string = undefined;
          if (item.sprint) {
            totalSprints = Math.ceil(item.target / item.sprint.target);
            completedSprints = Math.floor(item.done / item.sprint.target);
            sprints = `${completedSprints}/${totalSprints}`;
          }
          return (
            <Card key={item.id} className="flex flex-col gap-6 p-4">
              <div className="flex items-center justify-end gap-2">
                <div className="mr-auto flex flex-col gap-1">
                  <span className="font-medium">{item.project.name}</span>
                  <span className="text-xs capitalize">
                    {client?.name || "N/A"}
                  </span>
                </div>
                {statusMap[item.status] && (
                  <span className="text-xs capitalize">
                    {statusMap[item.status]}
                  </span>
                )}
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
              </div>
              <div className="relative">
                <CircularProgress
                  value={value}
                  className="mx-auto w-2/3 stroke-sky-900 shadow-black/0"
                  gradient={{
                    startColor: "#2196F3",
                    endColor: "#0c4a6e",
                  }}
                />
                <span className="absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 text-2xl font-medium">
                  {value.toFixed(2).toString().padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-center gap-6">
                  <div className="flex items-center gap-1">
                    <span className="size-5 rounded bg-gradient-to-r from-[#2196F3] to-[#0c4a6e]"></span>
                    <span className="font-medium text-gray-500">Done:</span>
                    <span className="font-medium">{item.done}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="size-5 rounded bg-muted"></span>
                    <span className="font-medium text-gray-500">Target:</span>
                    <span className="font-medium">{item.target}</span>
                  </div>
                </div>
                <Progress
                  value={value}
                  className="h-2 text-red-500"
                  color={
                    (value < 25 && "#ef4444") ||
                    (value < 75 && "#eab308") ||
                    "#22c55e"
                  }
                />
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Sprints</span>
                  <ConfigureSprintButton
                    commandProjectId={item.id}
                    sprint={item.sprint}
                    maxTarget={item.target}
                    size="icon"
                    variant="ghost"
                    className="size-7"
                  >
                    <ListChecksIcon size={16} />
                  </ConfigureSprintButton>
                  <span>{sprints || "N/A"}</span>
                  {/* <ListChecksIcon size={16} /> */}
                  {/* {<span>
                    {Math.floor(value)}/{item.sprint?.target}
                  </span>} */}
                  <CalendarDays size={16} className="ml-auto" />
                  <span className="text-gray-500">
                    {format(new Date(item.endDate), "PP")}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </main>
  );
};
