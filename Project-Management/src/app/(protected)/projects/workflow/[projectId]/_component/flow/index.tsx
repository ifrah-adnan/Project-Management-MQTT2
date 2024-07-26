/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { RefObject, useCallback, useRef } from "react";
import { useStore } from "../../store";
import "reactflow/dist/style.css";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Edge,
  applyEdgeChanges,
  applyNodeChanges,
  updateEdge,
} from "reactflow";
import AddOperation from "./operation/add";
import CustomNode from "./CustomNode";
import { NodeTypes } from "@/utils/types";
import CustomEdge from "./customEdge";
import { v4 as uuidv4 } from "uuid";
import EditOperation from "./operation/edit";
import CustomAndOr from "./NodeAndOr";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { getWorkFlow } from "../../../_utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
export const onDragOver = (event: any) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
};

const NodeType = {
  customNode: CustomNode,
  nodeAndOr: CustomAndOr,
};
const EdgeType = {
  customEdge: CustomEdge,
};

function Flow() {
  const { projectId } = useParams();
  const { nodes, edges, setNodes, setEdges, nodeSelected } = useStore();
  const reactFlowWrapper: RefObject<HTMLDivElement> = useRef(null);
  const edgeUpdateSuccessful = useRef(true);

  const { isLoading, error } = useSWR(
    `workflow/data/${projectId}`,
    async () => {
      const res = await getWorkFlow(projectId as string);
      return res;
    },
    {
      onSuccess: (res) => {
        setNodes(
          (res?.workFlow?.WorkflowNode.map((node: any) => node.data) ||
            []) as NodeTypes[],
        );
        setEdges(
          res?.workFlow?.WorkFlowEdge.map((edge: any) => edge.data) || [],
        );
      },
      onError: (e) => {
        toast.error("Something went wrong");
      },
    },
  );

  const onNodesChange = useCallback(
    (changes: any) => {
      setNodes(applyNodeChanges(changes, nodes) as NodeTypes[]);
    },
    [nodes],
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges],
  );

  const onEdgeUpdate = useCallback(
    (oldEdge: any, newConnection: any) => {
      setEdges(updateEdge(oldEdge, newConnection, edges));
    },
    [edges],
  );

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onConnect = useCallback(
    (params: any) => {
      const newEdge = {
        id: uuidv4(),
        source: params.source,
        target: params.target,
        type:
          nodes.find((node) => node.id === params.source)?.type === "nodeAndOr"
            ? "default"
            : "customEdge",
        label: params.label,
      };
      setEdges([...edges, newEdge]);
    },
    [edges],
  );

  const onEdgeUpdateEnd = useCallback(
    (_: any, edge: Edge) => {
      if (!edgeUpdateSuccessful.current) {
        setEdges(edges.filter((e) => e.id !== edge.id));
      }
      edgeUpdateSuccessful.current = true;
    },
    [edges],
  );

  return (
    <main className="relative h-[calc(100%-3.5rem)] w-full">
      {isLoading && (
        <div className="absolute left-0 top-0 z-[9999] flex h-full w-full items-center justify-center bg-black/20">
          <Loader2 size={40} className="animate-spin" />
        </div>
      )}
      <ReactFlow
        ref={reactFlowWrapper}
        nodes={nodes}
        edges={edges}
        className="h w-full"
        nodeTypes={NodeType}
        edgeTypes={EdgeType}
        minZoom={0.5}
        maxZoom={1.5}
        fitView
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeUpdate={onEdgeUpdate}
        onConnect={onConnect}
        onDragOver={onDragOver as any}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onEdgeUpdateStart={onEdgeUpdateStart}
      >
        <Background color="#7a7676" gap={10} variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <AddOperation />
      {nodeSelected && <EditOperation />}
    </main>
  );
}

export default Flow;
