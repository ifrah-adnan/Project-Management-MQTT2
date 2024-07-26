"use server";

import { createSafeAction } from "@/actions/utils";
import { db } from "@/lib/db";
import {
  TData,
  TCreateInput,
  createInputSchema,
  editInputSchema,
} from "./schemas";
import { ActionType, EntityType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { Session, getServerSession } from "@/lib/auth";
import { logHistory } from "../../History/_utils/action";
import { connect } from "http2";
const defaultParams: Record<string, string> = {
  page: "1",
  perPage: "10",
};

const getOrderBy = (orderBy = "createdAt", or = "desc") => {
  const order: "asc" | "desc" = or === "desc" ? "desc" : "asc";
  if (orderBy === "createdAt") return { createdAt: order };
  if (orderBy === "name") return { name: order };
  if (orderBy === "code") return { code: order };
  if (orderBy === "avgTime") return { avgTime: order };
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

  const where: Prisma.ExpertiseWhereInput = {
    organizationId: organizationId,
    OR: params.search
      ? [
          {
            name: { contains: params.search, mode: "insensitive" },
          },
          {
            code: { contains: params.search, mode: "insensitive" },
          },
        ]
      : undefined,
  };

  const [result, total] = await Promise.all([
    db.expertise.findMany({
      where,
      take,
      skip,
      orderBy: getOrderBy(params.orderBy, params.order),
      select: {
        id: true,
        name: true,
        code: true,
        organizationId: true,
        operations: { select: { id: true, name: true } },
        users: { select: { id: true, name: true } },
      },
    }),
    db.expertise.count({ where }),
  ]);

  return {
    data: result.map((item) => ({
      ...item,
      users: Array.isArray(item.users) ? item.users : [item.users],
    })),
    total,
  };
}

export async function deleteById(id: string, userId: string) {
  const deletedExpertise = await db.expertise.delete({ where: { id } });

  await db.history.create({
    data: {
      userId: userId,
      action: ActionType.DELETE,
      details: `Deleted expertise with name :${deletedExpertise.name}`,
      entity: EntityType.EXPERTISE,
      entityId: deletedExpertise.id,
    },
  });

  return deletedExpertise;
}
// const handler = async (
//   { operations, ...data }: TCreateInput,
//   session: Session | null | undefined,
// ) => {
//   const user = await db.expertise.create({
//     data: {
//       ...data,
//       operations: { connect: operations.map((id) => ({ id })) },
//     },
//   });
//   console.log(session?.user);
//   if (session?.user.id) {
//     await db.history.create({
//       data: {
//         userId: session.user.id,
//         action: ActionType.CREATE,

//         details: `Created expertise with name :${user.name}`,
//         entity: EntityType.EXPERTISE,

//         entityId: user.id,
//       },
//     });
//   }
//   return user;
// };

// export const create = createSafeAction({ scheme: createInputSchema, handler });
interface CreateExpertiseInput {
  name: string;
  code: string;
  operations: string[];
  userId: string;
}
export async function createExpertise({
  name,
  code,
  operations,
  userId,
}: CreateExpertiseInput): Promise<{
  result?: any;
  error?: string;
  fieldErrors?: Record<string, string>;
}> {
  try {
    console.log(userId, "tttttttt");
    const sessionUser = await getServerSession();
    const organizationId = sessionUser?.user.organizationId;

    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    const expertise = await db.expertise.create({
      data: {
        users: { connect: { id: userId } },
        name,
        code,
        organization: { connect: { id: organizationId } },
        operations: {
          connect: operations.map((id) => ({ id })),
        },
      },
    });

    await logHistory(
      ActionType.CREATE,
      `Expertise created: ${name} by user ${userId}`,
      EntityType.EXPERTISE,
      expertise.id,
      userId,
    );

    return { result: expertise };
  } catch (error: any) {
    const fieldErrors: Record<string, string> = {};

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        fieldErrors[error.meta?.target as string] =
          "This value is already taken.";
      }
    }

    return { error: error.message, fieldErrors };
  }
}
export async function getOperations() {
  const serverSession = await getServerSession();
  const organizationId =
    serverSession?.user.organizationId || serverSession?.user.organization?.id;

  if (!organizationId) {
    throw new Error("Organization ID not found");
  }
  let where: Prisma.OperationWhereInput = { organizationId: organizationId };
  return await db.operation.findMany({
    where,

    select: {
      id: true,
      name: true,
    },
  });
}
export interface TEditInput extends TCreateInput {
  expertiseId: string;
  user: string;
}
// const editExpertiseHandler = async ({
//   expertiseId,
//   operations,
//   ...data
// }: TEditInput) => {
//   const { ...rest } = data;
//   const result = await db.expertise.update({
//     where: { id: expertiseId },

//     data: {
//       ...rest,
//       operations: { connect: operations.map((id) => ({ id })) },
//     },
//   });
//   return result;
// };
// export const edit = createSafeAction({
//   scheme: editInputSchema,
//   handler: editExpertiseHandler,
// });

export async function updateExpertise({
  expertiseId,
  name,
  code,
  operations,
  user,
}: TEditInput): Promise<{
  result?: any;
  error?: string;
  fieldErrors?: Record<string, string>;
}> {
  try {
    const expertise = await db.expertise.update({
      where: { id: expertiseId },
      data: {
        name,
        code,
        operations: { connect: operations.map((id) => ({ id })) },
      },
    });

    await logHistory(
      ActionType.UPDATE,
      `Expertise updated: ${name} by user ${user}`,
      EntityType.EXPERTISE,
      expertise.id,

      user,
    );

    return { result: expertise };
  } catch (error: any) {
    const fieldErrors: Record<string, string> = {};

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        fieldErrors[error.meta?.target as string] =
          "This value is already taken.";
      }
    }

    return { error: error.message, fieldErrors };
  }
}

export async function handleDelete(id: string, userId: string) {
  await deleteById(id, userId);
  revalidatePath("/expertise");
}
