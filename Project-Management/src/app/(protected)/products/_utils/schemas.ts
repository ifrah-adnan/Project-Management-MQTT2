import { z } from "zod";

export const createInputSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters long",
  }),
  description: z
    .string()
    .min(2, {
      message: "description must be at least 2 characters long",
    })
    .optional(),
  workFlowId: z.string().optional(),
});

export type TCreateInput = z.infer<typeof createInputSchema>;

export type TData = {
  createdAt: Date;
  name: string;
  id: string;
  status: boolean;
  workFlowId: string | null;
}[];
