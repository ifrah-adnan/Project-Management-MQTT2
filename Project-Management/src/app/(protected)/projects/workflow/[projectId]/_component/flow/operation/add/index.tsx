import Card from "@/components/card";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Clock1, EllipsisVertical } from "lucide-react";
import React from "react";
import ButtonAddOperation from "../../../buttonAddOperation";
import { useStore } from "../../../../store";
import { NodeTypes } from "@/utils/types";
import icons from "../../../icons";
import { v4 as uuidv4 } from "uuid";
function AddOperation() {
  const { nodes, setSelectedDragElement } = useStore();

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    name: string,
  ) => {
    event.dataTransfer.setData("application/reactflow", "nodeAndOr");
    event.dataTransfer.effectAllowed = "move";
    setSelectedDragElement({
      id: uuidv4(),
      name: name,
      type: "nodeAndOr",
    });
  };

  return (
    <Card className="z-99 absolute inset-y-4 left-4 flex w-full max-w-80 !cursor-pointer flex-col gap-2 overflow-y-auto">
      <h3>Add Operation</h3>
      <Card
        role="button"
        variant="muted"
        className="flex items-center gap-4 p-2"
      >
        <ButtonAddOperation />
        <span>add new operation</span>
      </Card>
      <div className="flex flex-wrap gap-4 [&>*]:flex-1">
        <Card
          role="button"
          draggable
          variant="muted"
          className="flex items-center justify-between px-4 py-2"
          onDragStart={(e: any) => onDragStart(e, "AND")}
        >
          <span> AND</span>
          <Button variant="ghost" size="icon" className="size-6">
            <ChevronsUpDown size={16} />
          </Button>
        </Card>
        <Card
          draggable
          role="button"
          variant="muted"
          className="flex items-center justify-between px-4 py-2"
          onDragStart={(e: any) => onDragStart(e, "OR")}
        >
          <span>OR</span>
          <Button variant="ghost" size="icon" className="size-6">
            <ChevronsUpDown size={16} />
          </Button>
        </Card>
      </div>
      <div className="mx-auto h-[2px] w-[90%] bg-muted"></div>
      <h3 className="text-gray-400"> Operations added</h3>
      <div className="flex flex-1 flex-col items-center gap-2 overflow-y-auto">
        {nodes.map((node: NodeTypes, index) => {
          if (node.type === "customNode") {
            return (
              <Card
                key={index}
                className="flex w-full items-center gap-2 border border-[#AAAAAA]/70 p-2"
                variant="outline"
              >
                <Button variant="outline" className="size-8 p-1">
                  {React.createElement(
                    icons?.[
                      node?.data?.icon as keyof typeof icons
                    ] as React.ComponentType<{
                      size: number;
                    }>,
                    { size: 20 },
                  )}
                </Button>
                <div className="flex flex-col gap-1 truncate text-sm ">
                  <span>{node?.data?.name as string}</span>

                  <div className="flex items-center gap-1 text-xs text-[#AAAAAA]">
                    <Clock1 size={15} />
                    <span>
                      Time estimated:{node?.data?.timeEstimate as string}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="ml-auto size-5 rounded-full p-1"
                >
                  <EllipsisVertical size={14} />
                </Button>
              </Card>
            );
          } else
            return (
              <Card
                key={index}
                variant="outline"
                className="flex  items-center gap-2 border border-[#AAAAAA]/70 px-4 py-2 "
              >
                {node?.data?.name as string}
                <Button variant="ghost" size="icon" className="size-6">
                  <ChevronsUpDown size={16} />
                </Button>
              </Card>
            );
        })}
      </div>
    </Card>
  );
}

export default AddOperation;
