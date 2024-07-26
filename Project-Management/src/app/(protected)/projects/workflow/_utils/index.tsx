"use server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { numberToStringReverse } from "@/utils/functions";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
export const createWorkflow = async (
  nodes: any,
  edges: any,
  projectId: string,
  workflowId: string | null,
) => {
  try {
    const nodesData = nodes.map((node: any) => {
      return {
        id: node.id,
        operationId: node?.data?.operationId,
        data: {
          ...node,
        },
      };
    });

    const edgesData = edges.map((edges: any) => {
      return {
        id: uuidv4(),
        sourceId: edges.source,
        targetId: edges.target,
        count: parseInt(edges?.label || "0"),
        data: {
          ...edges,
        },
      };
    });

    if (workflowId) {
      await db.workFlow.update({
        where: {
          id: workflowId,
        },
        data: {
          WorkflowNode: {
            deleteMany: {},
            createMany: {
              data: nodesData,
            },
          },
          WorkFlowEdge: {
            deleteMany: {},
          },
        },
      });
      await db.workFlow.update({
        where: {
          id: workflowId,
          project: {
            id: projectId,
          },
        },
        data: {
          WorkFlowEdge: {
            connectOrCreate: edgesData.map((edge: any) => {
              return {
                where: {
                  id: edge.id,
                },
                create: {
                  ...edge,
                },
              };
            }),
          },
        },
      });
    } else {
      const res = await db.workFlow.create({
        data: {
          project: {
            connect: {
              id: projectId,
            },
          },
          WorkflowNode: {
            connectOrCreate: nodesData.map((node: any) => {
              return {
                where: {
                  id: node.id,
                },
                create: {
                  ...node,
                },
              };
            }),
          },
        },
      });
      await db.workFlow.update({
        where: {
          id: res.id,
        },
        data: {
          WorkFlowEdge: {
            connectOrCreate: edgesData.map((edge: any) => {
              return {
                where: {
                  id: edge.id,
                },
                create: {
                  ...edge,
                },
              };
            }),
          },
        },
      });
    }
  } catch (e: any) {
    console.log(e);
  }
};

export const createOperation = async (data: any) => {
  const serverSession = await getServerSession();
  const organizationId =
    serverSession?.user.organizationId || serverSession?.user.organization?.id;

  const res = await db.operation.create({
    data: {
      id: uuidv4(),

      code: data.code,

      name: data.name,
      icon: data.icon,
      description: data?.description || undefined,
      isFinal: data.isFinal,
      estimatedTime: numberToStringReverse(data.estimatedTime) as number,
      organization: {
        connect: { id: organizationId },
      },
    },
  });
  return res;
};

export const updateOperation = async (data: any) => {
  const res = await db.operation.update({
    where: {
      id: data.id,
    },
    data: {
      code: data?.code || undefined,
      name: data.name || undefined,
      icon: data.icon || undefined,
      isFinal: data?.isFinal || undefined,
      description: data?.description || undefined,
      estimatedTime:
        data?.estimatedTime &&
        (numberToStringReverse(data.estimatedTime) as number),
    },
  });
  return res;
};

export const logServer = async (data: any) => {
  const res = await db.user.findMany();
  return res;
};

export const getOperations = async (search: string) => {
  const res = await db.operation.findMany({
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
  });
  return res;
};

export const getWorkFlow = async (projectId: string) => {
  const res = await db.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      workFlow: {
        include: {
          WorkFlowEdge: true,
          WorkflowNode: true,
        },
      },
    },
  });
  return res;
};
