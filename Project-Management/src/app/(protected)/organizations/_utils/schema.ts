import { z } from "zod";

export const createInputSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters long",
  }),
  description: z.string().min(3, {
    message: "code must be at least 3 characters long",
  }),
  adress: z.string().min(4, {
    message: "address must be at least 4 characters long",
  }),

  adminName: z.string().min(2, {
    message: "name must be at least 2 characters long",
  }),
  adminEmail: z.string().email("Invalid email address"),
  adminPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
  imagePath: z.string().optional(),
});

export type TCreateInput = z.infer<typeof createInputSchema>;
export const createAdminOrganization = z.object({
  organizationId: z.string().min(2, {
    message: "id must be uuid",
  }),

  adminName: z.string().min(2, {
    message: "name must be at least 2 characters long",
  }),
  adminEmail: z.string().email("Invalid email address"),
  adminPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});

export type TCreateAdmin = z.infer<typeof createAdminOrganization>;
export type FieldErrors<T> = {
  [K in keyof T]?: string[];
};
