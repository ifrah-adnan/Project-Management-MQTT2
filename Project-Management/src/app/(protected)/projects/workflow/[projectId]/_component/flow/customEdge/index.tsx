import { Button } from "@/components/ui/button";
import Card from "@/components/card";
import { ChevronsUpDown, PlusIcon } from "lucide-react";
import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "reactflow";
import { useStore } from "../../../store";

export default function CustomEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, label, id } = props;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  const [dataLabel, setDatalabel] = React.useState(label || null);
  const { setEdges, edges } = useStore();
  const [updateLabel, setUpdateLabel] = React.useState(false);
  return (
    <>
      <BaseEdge
        path={edgePath}
        {...props}
        style={{
          stroke: "#FA993A",
          strokeWidth: 2,
          pointerEvents: "none",
        }}
      />

      <EdgeLabelRenderer>
        {dataLabel && !updateLabel ? (
          <Card
            className="absolute p-2 font-semibold"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              width: 40,
              height: 24,
              padding: 0,
              opacity: 0.6,
              textAlign: "center",
            }}
            onClick={() => {
              setUpdateLabel(true);
            }}
          >
            <span>{dataLabel}</span>
          </Card>
        ) : updateLabel ? (
          <Card
            variant="muted"
            className="absolute p-1"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              height: 24,
              padding: 0,
              opacity: 0.6,
            }}
          >
            <input
              type="number"
              value={(dataLabel as string) || ""}
              onChange={(e) => {
                setDatalabel(e.target.value);
              }}
              onBlur={() => {
                setUpdateLabel(false);
                const newEdges = edges.map((edge) => {
                  if (edge.id === id) {
                    edge.label = dataLabel;
                  }
                  return edge;
                });
                setEdges(newEdges);
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  setUpdateLabel(false);
                  const newEdges = edges.map((edge) => {
                    if (edge.id === id) {
                      edge.label = dataLabel;
                    }
                    return edge;
                  });
                  setEdges(newEdges);
                }
              }}
            />
          </Card>
        ) : (
          <Button
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              width: 24,
              height: 24,
              padding: 0,
              opacity: 0.6,
            }}
            onClick={() => {
              setUpdateLabel(true);
            }}
          >
            <PlusIcon size={16} />
          </Button>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
