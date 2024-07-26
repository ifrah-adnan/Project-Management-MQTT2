"use server";

import { db } from "@/lib/db";
import { TInput, inputSchema } from "./schema";
import bcrypt from "bcrypt";
import { createSafeAction } from "../utils";

const handler = async (data: TInput) => {
  const { name, email, password, organizationName } = data;
  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await db.$transaction(async (prisma) => {
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
      },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        organizationId: organization.id,
      },
    });

    return { user, organization };
  });

  return result;
};

export const signUpWithOrganization = createSafeAction({
  scheme: inputSchema,
  handler,
});
