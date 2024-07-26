import { z } from "zod";

export const createInputSchema = z.object({
  deviceId: z.string().min(4, {
    message: "deviceId must be at least 4 characters long",
  }),
  postId: z.string(),
  planningId: z.string().optional(),
  count: z.number().int().optional(),
});

export type TCreateInput = z.infer<typeof createInputSchema>;

export type TData = {
  id: string;
  deviceId: string;
  count: number | null;
  createdAt: Date;
  post: {
    id: string;
    name: string;
    plannings: {
      id: string;
      startDate: Date;
      endDate: Date;
      operation: { id: string; name: string };
    }[];
    expertises: {
      id: string;
      name: string;
      operations: { id: string; name: string }[];
    }[];
  } | null;
  planning: {
    commandProject: { id: string; project: { name: string } };
    startDate: Date;
    endDate: Date;
    operation: { id: string; name: string };
    operator: { id: string; name: string; image: string | null };
  } | null;
  user: {
    id: string;
    name: string;
  };
}[];

export const deviceConfigInputSchema = z.object({
  id: z.string().uuid(),
  deviceId: z.string().min(4, {
    message: "deviceId must be at least 4 characters long",
  }),
  postId: z.string(),
  planningId: z.string().optional(),
  count: z.number().int().optional(),
});

export type TdeviceConfigInput = z.infer<typeof deviceConfigInputSchema>;
