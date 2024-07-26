import Card from "@/components/card";
import React from "react";
import { Handle, Position } from "reactflow";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";

function CustomAndOr({
  data,
  isConnectable,
}: {
  data: {
    name: string;
  };
  isConnectable: boolean;
}) {
  return (
    <Card
      variant="muted"
      className="flex items-center justify-between gap-2 px-4 py-2"
    >
      <span>{data.name}</span>
      <Button variant="ghost" size="icon" className="size-6">
        <ChevronsUpDown size={16} />
      </Button>
      <Handle
        // isConnectable={isConnectable}
        type="source"
        id="source1"
        position={Position.Left}
        style={{
          background: "white",

          border: "none",
        }}
      />

      <Handle
        // isConnectable={isConnectable}
        type="source"
        id="source2"
        position={Position.Right}
        style={{
          background: "white",
          border: "none",
        }}
      />
    </Card>
  );
}

export default CustomAndOr;
