import { Button } from "@/components/ui/button";
import { Clock1, Search } from "lucide-react";
import React from "react";
import useSWR from "swr";
import icons from "../../icons";
import { numberToStringReverse } from "@/utils/functions";
import Card from "@/components/card";
import { cn } from "@/lib/utils";
import { useStore } from "../../../store";
import { NodeTypes } from "@/utils/types";
import { getOperations } from "../../../../_utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { v4 as uuid } from "uuid";
function SelectOperation({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [operationSelected, setOperationSelected] = React.useState<{
    name: string;
    icon: string;
    estimatedTime: number;
    isFinal: boolean;
    id: string;
    description: string;
    code: string;
    operationId: string;
  } | null>(null);
  const [search, setSearch] = React.useState("");
  const { data, isLoading, error } = useSWR(
    `getOperationSearch?name=${search}`,
    async () => {
      return getOperations(search);
    },
  );
  const { setNodes, nodes } = useStore();
  return (
    <div className="flex h-1 flex-1 flex-col gap-2 overflow-y-auto">
      <div className="flex items-center  gap-2 rounded-md border border-[#AAAAAA]/30 p-2">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border-none bg-transparent focus:outline-none"
        />
      </div>
      {data && data.length > 0 ? (
        <ScrollArea
          className="flex h-full w-full flex-col  gap-2 px-4"
          scrollareathumbclassName="w-4 bg-[#FA993A]"
          scrollbarclassName="w-2 "
        >
          {data.map((node: any, index: number) => {
            return (
              <Card
                key={index}
                variant="outline"
                className={cn(
                  " relative mt-2 flex w-full cursor-pointer items-center gap-4 rounded-md  border-[#D2D3D6] border-[2]  transition-colors ",
                  {
                    "bg-[#FA993A] text-white":
                      operationSelected?.id === node.id,
                  },
                )}
                onClick={() => {
                  setOperationSelected(node as any);
                }}
              >
                <Button variant="outline" type="button" className="size-12">
                  {node.icon &&
                    React.createElement(
                      icons?.[
                        node.icon as keyof typeof icons
                      ] as React.ComponentType<{
                        size: number;
                      }>,
                      { size: 20 },
                    )}
                </Button>
                <div className="text-md flex w-[90%] flex-col gap-1 truncate ">
                  {node?.name || <div>{"Operation name"}</div>}
                  <div className="flex items-center gap-1 text-sm opacity-60">
                    <Clock1 size={15} />
                    <span className="">
                      {"time estimate: "}
                      {numberToStringReverse(node?.estimatedTime) || (
                        <span>{"0h00min"}</span>
                      )}
                    </span>
                  </div>
                </div>
                {node.isFinal && (
                  <div className="absolute -right-[10px] top-[30px] rotate-45  whitespace-nowrap rounded-r-md rounded-tl-md bg-red-600 px-[32px] text-sm text-white">
                    Final
                  </div>
                )}
              </Card>
            );
          })}
        </ScrollArea>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          {isLoading ? "Loading..." : "No data found"}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          type="button"
          onClick={() => {
            setOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button
          type="button"
          color="#FA993A"
          className="bg-[#FA993A] hover:bg-[#FA993A]/40"
          onClick={() => {
            console.log({
              nodes,
              operationSelected,
            });
            const isExist = nodes.find(
              (node) => node.data?.operationId === operationSelected?.id,
            );
            const finalNode =
              nodes.find((node) => node.data.isFinal) &&
              operationSelected?.isFinal;

            if (operationSelected && !finalNode && !isExist) {
              setNodes([
                ...nodes,
                {
                  id: uuid(),
                  type: "customNode",
                  data: {
                    name: operationSelected.name,
                    description: operationSelected.description,
                    icon: operationSelected.icon,
                    estimatedTime: numberToStringReverse(
                      operationSelected.estimatedTime,
                    ),
                    isFinal: operationSelected.isFinal,
                    code: operationSelected.code,
                    operationId: operationSelected.id,
                  },
                  position: { x: 750, y: 250 },
                } as NodeTypes,
              ]);
              setOpen(false);
              setOperationSelected(null);
            }
          }}
        >
          select Operation
        </Button>
      </div>
    </div>
  );
}

export default SelectOperation;
