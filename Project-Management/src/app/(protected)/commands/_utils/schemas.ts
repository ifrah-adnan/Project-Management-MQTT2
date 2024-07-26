import { Status } from "@prisma/client";
import { z } from "zod";

export const createInputSchema = z.object({
  reference: z.string().min(2, {
    message: "Reference must be at least 2 characters long",
  }),
  clientId: z.string().min(1, { message: "Client is required" }),
  commandProjects: z
    .array(
      z.object({
        projectId: z.string(),
        target: z.number().int(),
        endDate: z.date(),
      }),
    )
    .min(1, { message: "At least one project is required" }),
});

export type TCreateInput = z.infer<typeof createInputSchema>;
export const createInputSchemaforUpdate = z.object({
  commandId: z.string().uuid().optional(),

  reference: z.string().min(2, {
    message: "Reference must be at least 2 characters long",
  }),
  clientId: z.string().min(1, { message: "Client is required" }),
});
export type TCreateInputforUpdate = z.infer<typeof createInputSchemaforUpdate>;

export type TData = {
  id: string;
  client: {
    id: string;
    image: string | null;
    name: string;
  } | null;
  commandProjects: {
    target: number;
    project: {
      name: string;
      status: boolean;
    };
    status: Status;
    endDate: Date;
  }[];
  reference: string;
  user: {
    id: string;
    name: string;
  } | null;
}[];

export type TData2 = {
  id: string;
  client: {
    id: string;
    image: string | null;
    name: string;
  };
  user: {
    id: string;
    name: string;
  }[];

  reference: string;
}[];
