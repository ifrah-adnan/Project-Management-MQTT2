import { z } from "zod";

export const createInputSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters long",
  }),
  code: z.string().min(3, {
    message: "code must be at least 3 characters long",
  }),
  operations: z.array(z.string()),
});

export type TCreateInput = z.infer<typeof createInputSchema>;

export type TData = {
  id: string;
  name: string;
  code: string;
  operations: {
    id: string;
    name: string;
  }[];
  users: {
    id: string;
    name: string;
  }[];
  organizationId: string;
}[];
export const editInputSchema = z.object({
  expertiseId: z.string().uuid(),
  name: z.string().min(2, {
    message: "name must be at least 2 characters long",
  }),
  code: z.string(),
  operations: z.array(z.string()),
});

export type TEditInput = z.infer<typeof editInputSchema>;
