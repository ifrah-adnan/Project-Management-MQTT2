"use server";

import { CustomError, createSafeAction } from "@/actions/utils";
import { db } from "@/lib/db";
import {
  TData,
  TCreateInput,
  createInputSchema,
  createInputSchemaforUpdate,
  TData2,
} from "./schemas";
import { ActionType, EntityType, Prisma } from "@prisma/client";
import { logHistory } from "../../History/_utils/action";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";

const defaultParams: Record<string, string> = {
  page: "1",
  perPage: "10",
};

const getOrderBy = (orderBy = "createdAt", or = "desc") => {
  const order: "asc" | "desc" = or === "desc" ? "desc" : "asc";
  if (orderBy === "createdAt") return { createdAt: order };
  if (orderBy === "target") return { target: order };
  if (orderBy === "product") return { product: { name: order } };
  if (orderBy === "project") return { project: { name: order } };
  if (orderBy === "deadline") return { deadline: order };
  return { createdAt: "desc" as "desc" };
};

export async function findMany(params = defaultParams): Promise<{
  data: TData;
  total: number;
}> {
  const page = parseInt(params.page) || 1;
  const perPage = parseInt(params.perPage) || 10;
  const skip = (page - 1) * perPage;
  const take = perPage;

  const serverSession = await getServerSession();
  const organizationId =
    serverSession?.user.organizationId || serverSession?.user.organization?.id;

  if (!organizationId) {
    throw new Error("Organization ID not found");
  }
  let where: Prisma.CommandWhereInput = { organizationId: organizationId };

  if (params.search) {
    where.OR = [
      {
        reference: { contains: params.search, mode: "insensitive" },
      },
      {
        client: { name: { contains: params.search, mode: "insensitive" } },
      },
    ];
  }

  const [result, total] = await Promise.all([
    db.command.findMany({
      where,
      take,
      skip,
      orderBy: getOrderBy(params.orderBy, params.order),
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        reference: true,
        client: { select: { id: true, name: true, image: true } },
        commandProjects: {
          select: {
            project: { select: { name: true, status: true } },
            target: true,
            endDate: true,
            status: true,
          },
        },
      },
    }),
    db.command.count({ where }),
  ]);

  const data = result;
  return { data, total };
}

export async function deleteById(id: string, userId: string) {
  const serverSession = await getServerSession();
  const organizationId =
    serverSession?.user.organizationId || serverSession?.user.organization?.id;
  if (!organizationId) {
    throw new Error("Unauthorized");
  }

  const deleteWhere: Prisma.CommandWhereUniqueInput = {
    id,
    organizationId: organizationId,
  };

  const deletedCommand = await db.$transaction(async (tx) => {
    await tx.commandProject.deleteMany({
      where: { commandId: id },
    });

    // Ensuite, supprimez la commande elle-même
    return tx.command.delete({
      where: deleteWhere,
    });
  });
  await logHistory(
    ActionType.DELETE,
    "command deleted",
    EntityType.COMMAND,
    deletedCommand.id,
    userId,
  );

  return deletedCommand;
}

// const handler = async (data: TCreateInput) => {
//   const { organizationId } = await getSessionAndOrganizationId();
//   const user = await db.command.create({
//     data: {
//       reference: data.reference,

//       client: data.clientId ? { connect: { id: data.clientId } } : undefined,
//       organization: { connect: { id: organizationId } },

//       commandProjects: {
//         createMany: {
//           data: data.commandProjects.map((cp) => ({
//             endDate: cp.endDate,
//             projectId: cp.projectId,
//             target: cp.target,
//             organizationId,
//           })),
//         },
//       },
//     },
//   });
//   return user;
// };

// export const create = createSafeAction({ scheme: createInputSchema, handler });

interface CreateCommandInput {
  reference: string;
  clientId: string;
  commandProjects: {
    projectId: string;
    target: number;
    endDate: Date;
  }[];
  userId: string;
}
interface CreateOnlyCommandInput {
  reference: string;
  clientId: string;
}
export async function createOnlyCommand({
  reference,
  clientId,
}: CreateOnlyCommandInput): Promise<{
  result?: any;
  error?: string;
  fieldErrors?: Record<string, string>;
}> {
  const sessionUser = await getServerSession();
  const organizationId = sessionUser?.user.organizationId;

  if (!organizationId) {
    return { error: "User is not associated with an organization" };
  }

  const client = await db.user.findFirst({
    where: { id: clientId, organizationId, role: "CLIENT" },
  });

  if (!client) {
    return { error: "Invalid client for this organization" };
  }

  try {
    const command = await db.command.create({
      data: {
        reference,
        client: { connect: { id: clientId } },
        organization: { connect: { id: organizationId } }, // Ajout de la connexion à l'organisation
      },
    });

    return { result: command };
  } catch (error) {
    console.error("Error creating command:", error);
    return { error: "Failed to create command" };
  }
}
export async function createCommandd({
  reference,
  clientId,
  commandProjects,
  userId,
}: CreateCommandInput): Promise<{
  result?: any;
  error?: string;
  fieldErrors?: Record<string, string>;
}> {
  const serverSession = await getServerSession();
  const organizationId =
    serverSession?.user.organizationId || serverSession?.user.organization?.id;

  if (!organizationId) {
    throw new Error("Organization ID not found");
  }

  // Verify that the client belongs to the same organization
  const client = await db.user.findFirst({
    where: { id: clientId, organizationId, role: "CLIENT" },
  });
  if (!client) {
    return { error: "Invalid client for this organization" };
  }

  // Verify that all projects belong to the same organization
  const projectIds = commandProjects.map((cp) => cp.projectId);
  const projects = await db.project.findMany({
    where: { id: { in: projectIds }, organizationId },
  });
  if (projects.length !== projectIds.length) {
    return { error: "One or more projects are invalid for this organization" };
  }

  const command = await db.command.create({
    data: {
      reference,
      client: { connect: { id: clientId } },
      organization: { connect: { id: organizationId } },
      commandProjects: {
        createMany: {
          data: commandProjects.map((cp) => ({
            endDate: cp.endDate,
            projectId: cp.projectId,
            target: cp.target,
            organizationId,
            userId,
          })),
        },
      },
      user: { connect: { id: userId } },
    },
  });
  await logHistory(
    ActionType.CREATE,
    "command created",
    EntityType.COMMAND,
    command.id,
    userId,
  );
  return { result: command };
}

export async function getProjectsNames() {
  const serverSession = await getServerSession();
  const organizationId =
    serverSession?.user.organizationId || serverSession?.user.organization?.id;

  if (!organizationId) {
    throw new CustomError("Unauthorized");
  }

  return await db.project.findMany({
    where: organizationId ? { organizationId } : {},
    select: { id: true, name: true },
  });
}

export async function getCommands() {
  const serverSession = await getServerSession();
  const organizationId =
    serverSession?.user.organizationId || serverSession?.user.organization?.id;

  if (!organizationId) {
    throw new Error("Organization ID not found");
  }
  let where: Prisma.CommandWhereInput = { organizationId: organizationId };
  return await db.command.findMany({
    where,
    select: { reference: true, id: true },
  });
}

export async function getProjects() {
  const serverSession = await getServerSession();
  const organizationId =
    serverSession?.user.organizationId || serverSession?.user.organization?.id;

  if (!organizationId) {
    throw new Error("Organization ID not found");
  }
  let where: Prisma.ProjectWhereInput = { organizationId: organizationId };
  return await db.project.findMany({
    where,
    select: { name: true, id: true },
  });
}

export async function getClients() {
  const serverSession = await getServerSession();
  const organizationId =
    serverSession?.user.organizationId || serverSession?.user.organization?.id;

  if (!organizationId) {
    throw new Error("Organization ID not found");
  }
  let where: Prisma.UserWhereInput = {
    organizationId: organizationId,
    role: "CLIENT",
  };

  return await db.user.findMany({
    where,
    select: { name: true, id: true, image: true },
  });
}

export interface TEditInput {
  commandId?: string;
  reference: string;
  clientId: string;
}

// const createCommandHandler = async (data: TEditInput) => {
//   const { organizationId } = await getSessionAndOrganizationId();

//   const client = await db.user.findFirst({
//     where: { id: data.clientId, organizationId, role: "CLIENT" },
//   });
//   if (!client) {
//     throw new CustomError("Invalid client for this organization");
//   }

//   const user = await db.command.create({
//     data: {
//       reference: data.reference,
//       client: { connect: { id: data.clientId } },
//       organization: { connect: { id: organizationId } },
//     },
//   });
//   return user;
// };

// export const createCommand = createSafeAction({
//   scheme: createInputSchemaforUpdate,
//   handler: createCommandHandler,
// });

const editCommandHandler = async ({ commandId, ...data }: TEditInput) => {
  const serverSession = await getServerSession();
  const organizationId =
    serverSession?.user.organizationId || serverSession?.user.organization?.id;
  // Verify that the command belongs to the organization
  const existingCommand = await db.command.findFirst({
    where: { id: commandId, organizationId },
  });
  if (!existingCommand) {
    throw new CustomError("Command not found or not authorized");
  }

  // Verify that the client belongs to the same organization
  const client = await db.user.findFirst({
    where: { id: data.clientId, organizationId, role: "CLIENT" },
  });
  if (!client) {
    throw new CustomError("Invalid client for this organization");
  }

  const result = await db.command.update({
    where: { id: commandId },
    data: {
      ...data,
    },
  });
  return result;
};

export const edit = createSafeAction({
  scheme: createInputSchemaforUpdate,
  handler: editCommandHandler,
});

export async function handleDelete(id: string, userId: string) {
  await deleteById(id, userId);
  revalidatePath("/commands");
}
