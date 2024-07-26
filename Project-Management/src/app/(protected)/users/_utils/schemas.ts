// import { roles } from "@/utils";
import { roles } from "@/utils";
import { Role } from "@prisma/client";
import { z } from "zod";

export const createInputSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters long",
  }),
  email: z.string().email({
    message: "invalid email",
  }),
  password: z.string().min(6, {
    message: "password must be at least 6 characters long",
  }),
  role: z.enum(roles),
  expertise: z.array(z.string()).optional(),
});

export type TCreateInput = z.infer<typeof createInputSchema>;

export type TData = {
  createdAt: Date;
  organizationId: string;
  email: string;
  name: string;
  expertises: {
    name: string;
    id: string;
  }[];
  id: string;
  image: string | null;
  role: Role;
}[];

export type TData2 = {
  createdAt?: Date;
  email?: string;
  name?: string;
  expertises?: {
    name?: string;
    id?: string;
  }[];
  id?: string;
  image?: string | null;
  role?: Role;
}[];
export const updateInputSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(Role),
  password: z.string().optional(),
  expertise: z.array(z.string()).optional(),
});

// TypeScript type for the input data
export type TUpdateInput = z.infer<typeof updateInputSchema>;
