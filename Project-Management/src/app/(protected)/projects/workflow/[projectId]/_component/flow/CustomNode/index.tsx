import Card from "@/components/card";
import React from "react";
import { Handle, Position } from "reactflow";
import { Button } from "@/components/ui/button";
import { Clock1, EllipsisVertical, Pencil, Repeat, Trash2 } from "lucide-react";
import icons from "../../icons";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStore } from "../../../store";

function CustomNode({
  data,
  id,
  isConnectable,
}: {
  data: {
    name: string;
    icon: string;
    description: string;
    estimatedTime: string;
    isFinal: boolean;
    operationId: string;
  };
  id: string;
  isConnectable: boolean;
}) {
  const { nodes, edges, setEdges, setNodes, setNodeSelected, nodeSelected } =
    useStore();
  return (
    <Card
      variant="muted"
      className="relative min-w-[14rem] max-w-full px-2 py-1"
      style={{
        boxShadow:
          nodeSelected?.id === id
            ? "0px 3.2px 0px 0px #3357A3"
            : "0px 3.2px 0px 0px #00000026",
        transition: "box-shadow 0.3s",
      }}
    >
      <Handle
        type="target"
        id="source1"
        isConnectable={isConnectable}
        position={Position.Top}
        style={{
          background: "white",
          width: "10px",
          height: "10px",
          border: "none",
        }}
      />

      <div className="flex h-full w-full items-center gap-2">
        <Button variant="outline" className="size-12">
          {data.icon &&
            typeof data.icon === "string" &&
            React.createElement(
              icons?.[data.icon as keyof typeof icons] as React.ComponentType<{
                size: number;
              }>,
              { size: 20 },
            )}
        </Button>
        <div className="flex flex-col gap-1 truncate text-sm ">
          <span>
            {data.name} {data.isFinal ? "(Final)" : ""}
          </span>

          <div className="flex items-center gap-1 text-xs text-[#AAAAAA]">
            <Clock1 size={15} />
            <span>Time estimated:{data.estimatedTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button className="size-5 rounded-full p-0" variant="ghost">
            <Repeat size={14} />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button className="size-5 rounded-full p-0" variant="ghost">
                <EllipsisVertical size={14} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[6rem] p-0">
              <div className="flex flex-col gap-1">
                <Button
                  onClick={() => {
                    const node = nodes.find((node) => node.id === id);
                    if (!node) return;
                    setNodeSelected(node);
                  }}
                  variant="ghost"
                  className=" flex items-center justify-start gap-2 px-2 text-sm"
                >
                  <Pencil size={20} />
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    const newEdges = edges.filter(
                      (edge) => edge.source !== id && edge.target !== id,
                    );
                    setEdges(newEdges);
                    const newNodes = nodes.filter((node) => node.id !== id);
                    setNodes(newNodes);
                  }}
                  variant="ghost"
                  color="danger"
                  className="flex items-center justify-start gap-2 px-2 text-sm hover:bg-red-100 hover:text-red-500"
                >
                  <Trash2 size={20} />
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {!data.isFinal && (
        <Image
          src={
            nodeSelected?.id === id
              ? "/head-node-selected.svg"
              : "/head-node.svg"
          }
          alt="head-node"
          width={40}
          height={40}
          className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-[98%]"
        />
      )}

      <Handle
        type="source"
        id="source1"
        isConnectable={isConnectable}
        position={Position.Bottom}
        style={{
          position: "absolute",
          width: "1rem",
          height: "1rem",
          borderRadius: "100%",
          bottom: "0",
          left: "50%",
          transform: "translate(-50%, 98%)",
          border: "none",
          background: "transparent",
        }}
      />
    </Card>
  );
}

export default CustomNode;
