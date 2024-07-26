"use client";
import React from "react";
import { ArrowLeft, PanelBottomClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "../../store";
import { toast } from "sonner";
import { createWorkflow } from "../../../_utils";

export default function Header({ workflowId }: { workflowId: string | null }) {
  const router = useRouter();
  const { nodes, edges } = useStore();
  const projectId = useParams().projectId;
  return (
    <div className="font-sm flex h-page-header shrink-0 items-center justify-end gap-2 bg-card px-6 text-sm shadow">
      <h3 className="mr-auto flex items-center gap-2 font-medium capitalize">
        <Button
          variant="ghost"
          className="size-8 rounded-full p-0"
          onClick={() => {
            router.push("/projects");
          }}
        >
          <ArrowLeft />
        </Button>
        projects
      </h3>
      <Button
        variant="outline"
        className="text-gray-400"
        onClick={() => {
          router.push("/projects");
        }}
      >
        Cancel
      </Button>

      <Button
        className="flex gap-2"
        onClick={(e) => {
          if (nodes.length === 0) {
            e.preventDefault();
            toast.error("Please add at least one operation");
            return;
          }
          try {
            createWorkflow(nodes, edges, projectId as string, workflowId);
            toast.success("Workflow saved successfully");
            router.push("/projects");
          } catch (e) {
            toast.error("Something went wrong");
          }
        }}
      >
        <PanelBottomClose size={20} />
        <span>{!workflowId ? "Save" : "Edit"} & Close</span>
      </Button>
    </div>
  );
}
