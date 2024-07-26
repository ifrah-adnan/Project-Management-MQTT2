"use server";

import { createSafeAction } from "@/actions/utils";
import { db } from "@/lib/db";
import {
  TData,
  TCreateInput,
  createInputSchema,
  TOperator,
  TExpertise,
  TAddPlanningInput,
  addPlanningSchema,
  TPlanning,
  editInputSchema,
} from "./schemas";
import { ActionType, EntityType, Planning, Prisma } from "@prisma/client";
import { Session, getServerSession } from "@/lib/auth";
import { logHistory } from "../../History/_utils/action";
import { revalidatePath } from "next/cache";
import { findUserById } from "../../users/_utils/actions";

const defaultParams: Record<string, string> = {
  page: "1",
  perPage: "10",
};

const getOrderBy = (orderBy = "createdAt", or = "desc") => {
  const order: "asc" | "desc" = or === "desc" ? "desc" : "asc";
  if (orderBy === "createdAt") return { createdAt: order };
  if (orderBy === "name") return { name: order };
  return { createdAt: "desc" as "desc" };
};
export async function findMany(params = defaultParams): Promise<{
  data: TData;
  total: number;
}> {
  const serverSession = await getServerSession();
  const organizationId =
    serverSession?.user.organizationId || serverSession?.user.organization?.id;

  const page = parseInt(params.page) || 1;
  const perPage = parseInt(params.perPage) || 10;
  const skip = (page - 1) * perPage;
  const take = perPage;

  const where: Prisma.PostWhereInput = {
    organizationId: organizationId,
    OR: params.search
      ? [
          {
            name: { contains: params.search, mode: "insensitive" },
          },
        ]
      : undefined,
  };

  const [result, total] = await Promise.all([
    db.post.findMany({
      where,
      take,
      skip,
      orderBy: getOrderBy(params.orderBy, params.order),
      select: {
        id: true,
        name: true,
        organizationId: true,
        createdAt: true,
        expertises: {
          select: {
            id: true,
            name: true,
            operations: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        plannings: {
          where: { endDate: { gt: new Date() }, startDate: { lt: new Date() } },
          select: {
            commandProject: {
              select: { id: true, project: { select: { name: true } } },
            },
            operation: { select: { id: true, name: true } },
            operator: { select: { id: true, name: true, image: true } },
            startDate: true,
            endDate: true,
          },
        },
        users: { select: { id: true, name: true } }, // Ensure users is always an array
      },
    }),
    db.post.count({ where }),
  ]);

  const data = result.map((post) => ({
    ...post,
    users: Array.isArray(post.users) ? post.users : [post.users], // Ensure users is an array
  }));

  return { data, total };
}
export async function deleteById(id: string, userId: string) {
  await db.planning.deleteMany({ where: { postId: id } });
  const deletedPost = await db.post.delete({ where: { id } });
  await logHistory(
    ActionType.DELETE,
    "post deleted",
    EntityType.DEVICE,
    deletedPost.id,
    userId,
  );
}

// const handler = async (
//   { expertises, ...data }: TCreateInput,
//   session?: Session | null,
// ) => {
//   const { ...rest } = data;
//   const result = await db.post.create({
//     data: {
//       ...rest,
//       expertises: { connect: expertises.map((id) => ({ id })) },
//     },
//   });
//   return result;
// };

// export const create = createSafeAction({ scheme: createInputSchema, handler });
interface CreatePostInput {
  name: string;
  expertises: string[];
  userId: string;
}
export async function createPost({
  name,
  expertises,
  userId,
}: CreatePostInput): Promise<{
  result?: any;
  error?: string;
  fieldErrors?: Record<string, string>;
}> {
  try {
    const sessionUser = await getServerSession();
    const organizationId = sessionUser?.user.organizationId;

    if (!organizationId) {
      return { error: "Organization ID is not available" };
    }

    console.log("Creating post with data:", { name, expertises, userId });

    const post = await db.post.create({
      data: {
        users: { connect: { id: userId } },
        name,
        expertises: {
          connect: expertises.map((id) => ({ id })),
        },
        organization: { connect: { id: organizationId } },
      },
    });

    const user = await findUserById(userId);
    await logHistory(
      ActionType.CREATE,
      `Post created by ${user.name} and his role ${user.role}`,
      EntityType.POSTS,
      post.id,
      userId,
    );

    return { result: post };
  } catch (error: any) {
    console.error("Error creating post:", error);
    return { error: error.message };
  }
}
export interface TEditInput extends TCreateInput {
  postId: string;
}
const editPostHandler = async ({ postId, expertises, ...data }: TEditInput) => {
  const { ...rest } = data;
  const result = await db.post.update({
    where: { id: postId },
    data: {
      ...rest,
      expertises: { connect: expertises.map((id) => ({ id })) },
    },
  });
  return result;
};
export const edit = createSafeAction({
  scheme: editInputSchema,
  handler: editPostHandler,
});

const addPlanningHandler = async ({
  planningId,
  ...data
}: TAddPlanningInput) => {
  const select = {
    id: true,
    startDate: true,
    endDate: true,
    operator: { select: { name: true, image: true, id: true } },
    operation: { select: { name: true, id: true } },
  };
  if (!planningId)
    return await db.planning.create({
      data,
      select,
    });
  return await db.planning.update({ where: { id: planningId }, data, select });
};

export const addPlanning = createSafeAction({
  scheme: addPlanningSchema,
  handler: addPlanningHandler,
});

export async function getOperations({
  operationsInExpertises = [],
}: {
  operationsInExpertises?: string[];
}): Promise<TExpertise[]> {
  if (operationsInExpertises.length === 0)
    return await db.operation.findMany({
      select: { name: true, id: true },
    });
  return await db.operation.findMany({
    select: { name: true, id: true },
    where: { id: { in: operationsInExpertises } },
  });
}
export async function getOperations2({
  operationsInExpertises = [],
  command_project_id,
}: {
  operationsInExpertises?: string[];
  command_project_id: string;
}): Promise<TExpertise[]> {
  const project = await db.commandProject.findUnique({
    where: { id: command_project_id },
    select: { projectId: true },
  });
  if (project) {
    const workFlow = await db.project.findUnique({
      where: { id: project.projectId },
      select: { workFlowId: true },
    });
    const workflowId = workFlow?.workFlowId;
    if (workflowId) {
      // const WorkflowNodes = await db.workFlowNode.findMany({
      //   select:{id:true},
      //   where:{workFlowId: workflowId}
      // })
      if (operationsInExpertises.length === 0)
        return await db.operation.findMany({
          where: {
            WorkflowNode: { some: { workFlowId: workflowId } },
          },
          select: { name: true, id: true },
        });
      return await db.operation.findMany({
        select: { name: true, id: true },
        where: {
          AND: {
            id: { in: operationsInExpertises },
            WorkflowNode: { some: { workFlowId: workflowId } },
          },
        },
      });
    } else return [];
  } else return [];
}

export async function getOperators({
  operatorsInExperises = [],
}: {
  operatorsInExperises?: string[];
}) {
  if (operatorsInExperises.length === 0)
    return await db.user.findMany({
      select: {
        name: true,
        id: true,
        image: true,
      },
      where: {
        role: "OPERATOR",
      },
    });
  return await db.user.findMany({
    select: {
      name: true,
      id: true,
      image: true,
    },
    where: {
      role: "OPERATOR",
      expertises: { some: { id: { in: operatorsInExperises } } },
    },
  });
}

export async function getCommands() {
  return await db.command.findMany({ select: { reference: true, id: true } });
}
export async function getCommandProjects() {
  return await db.commandProject.findMany({
    select: {
      project: { select: { name: true, id: true } },
      command: { select: { reference: true, id: true } },
      id: true,
    },
  });
}

export async function getPlannings({
  postId,
}: {
  postId?: string;
}): Promise<TPlanning[]> {
  return await db.planning.findMany({
    where: { postId, endDate: { gt: new Date() } },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      operator: { select: { name: true, image: true, id: true } },
      operation: { select: { name: true, id: true } },
      commandProject: {
        select: { project: { select: { id: true, name: true } }, id: true },
      },
    },
  });
}

export async function deletePlanning(id: string) {
  return await db.planning.delete({ where: { id } });
}

export async function getExpertises() {
  const serverSession = await getServerSession();
  const organizationId =
    serverSession?.user.organizationId || serverSession?.user.organization?.id;
  if (!organizationId) {
    throw new Error("Organization ID not found");
  }
  let where: Prisma.ExpertiseWhereInput = { organizationId: organizationId };

  return await db.expertise.findMany({
    where,
    select: { name: true, id: true },
  });
}
export async function createOperationHistory(
  planing_id: string,
  count: number,
) {
  const operationHistory = await db.operationHistory.create({
    data: {
      planningId: planing_id,
      count: +count,
    },
  });
}

export async function handleDelete(id: string, userId: string) {
  await deleteById(id, userId);
  revalidatePath("/posts");
}
