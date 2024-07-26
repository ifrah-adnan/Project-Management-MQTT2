"use server";
import { db } from "@/lib/db";

import {
  createAdminOrganization,
  createInputSchema,
  TCreateAdmin,
  TCreateInput,
} from "./schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { ActionType, EntityType, Prisma } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";
import { logHistory } from "../../History/_utils/action";
import { getServerSession } from "@/lib/auth";
export async function createOrganizationWithAdmin(
  data: TCreateInput,
  imagePath: string | null,
) {
  try {
    const sessionUser = await getServerSession();
    console.log("user id ", sessionUser?.user);

    const validatedData = createInputSchema.parse(data);

    const hashedPassword = await bcrypt.hash(validatedData.adminPassword, 10);

    const result = await db.$transaction(async (prisma) => {
      const organization = await prisma.organization.create({
        data: {
          name: validatedData.name,
          address: validatedData.adress,
          description: validatedData.description,
          imagePath: imagePath,
        },
      });

      const admin = await prisma.user.create({
        data: {
          name: validatedData.adminName,
          email: validatedData.adminEmail,
          password: hashedPassword,
          role: "ADMIN",
          organizationId: organization.id,
        },
      });

      try {
        await logHistory(
          ActionType.CREATE,
          "CREATE ORGANIZATION",
          EntityType.ORGANIZATION,
          organization.id,
          sessionUser?.user.id,
        );
      } catch (historyError) {
        console.error("Error logging history:", historyError);
        // Optionally handle the error, like sending a notification or logging it to a different system
      }

      return { organization, admin };
    });

    revalidatePath("/organisations");
    return result;
  } catch (error) {
    console.error("Error creating organization and admin:", error);
    throw new Error(
      "An unexpected error occurred while creating the organization and admin.",
    );
  }
}
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

export type TData = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  imagePath: string | null;
  address: string | null;
  users: {
    id: string;
    name: string;
    email: string;
  }[];
}[];
export async function getOrganizationId(id: any) {
  const organization = await db.organization.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      imagePath: true,
    },
  });
  if (!organization) {
    throw new Error("Organization not found");
  }
  return organization;
}
export async function OrganizationfindMany(params = defaultParams): Promise<{
  data: TData;
  total: number;
}> {
  const page = parseInt(params.page) || 1;
  const perPage = parseInt(params.perPage) || 10;
  const skip = (page - 1) * perPage;
  const take = perPage;
  const where: Prisma.OrganizationWhereInput = {
    OR: params.search
      ? [
          {
            name: { contains: params.search, mode: "insensitive" },
          },
        ]
      : undefined,
  };
  const [result, total] = await Promise.all([
    db.organization.findMany({
      where,
      take,
      skip,
      orderBy: getOrderBy(params.orderBy, params.order),
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        imagePath: true,
        address: true,
        users: {
          where: {
            role: "ADMIN",
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    db.organization.count(),
  ]);
  return {
    data: result,
    total,
  };
}

export async function getOrganizations(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;

    const [organizations, totalCount] = await Promise.all([
      db.organization.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          users: {
            where: {
              role: "ADMIN",
            },
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.organization.count(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      organizations,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching organizations:", error);
    throw error;
  } finally {
    revalidatePath("/organizations");
  }
}

export async function deleteOrganization(id: string) {
  try {
    await db.organization.delete({
      where: {
        id,
      },
    });

    revalidatePath("/organizations");
  } catch (error) {
    console.error("Error deleting organization:", error);
    throw error;
  }
}
export async function AddAdminToOrganization(data: TCreateAdmin) {
  try {
    const validatedData = createAdminOrganization.parse(data);
    const hashedPassword = await bcrypt.hash(validatedData.adminPassword, 10);

    const admin = await db.user.create({
      data: {
        name: validatedData.adminName,
        email: validatedData.adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        organization: {
          connect: { id: validatedData.organizationId },
        },
      },
    });
    return { admin };
  } catch (error) {
    console.error("Error create admin:", error);
    throw error;
  }
}
type UpdateOrganization = {
  id: string;
  name: string;
  description: string;
};
export async function EditOrganization(data: UpdateOrganization) {
  try {
    await db.organization.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
      },
    });
    revalidatePath(`/organizations`);
    return { id: data.id };
  } catch (error) {
    console.error("Error editing organization:", error);
    throw error;
  }
}
