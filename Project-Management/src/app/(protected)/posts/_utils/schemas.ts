import { z } from "zod";

export const createInputSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters long",
  }),
  expertises: z.array(z.string()),
});
export const editInputSchema = z.object({
  postId: z.string().uuid(),
  name: z.string().min(2, {
    message: "name must be at least 2 characters long",
  }),
  expertises: z.array(z.string()),
});

export type TCreateInput = z.infer<typeof createInputSchema>;

export const addPlanningSchema = z.object({
  postId: z.string(),
  planningId: z.string().optional(),
  commandProjectId: z.string().min(2, {
    message: "Operator is required",
  }),
  operatorId: z.string().min(2, {
    message: "Operator is required",
  }),
  operationId: z.string().min(2, {
    message: "Operation is required",
  }),
  startDate: z.date({
    required_error: "Start date is required",
    message: "Invalid date",
  }),
  endDate: z.date({
    required_error: "End date is required",
    message: "Invalid date",
  }),
});

export type TAddPlanningInput = z.infer<typeof addPlanningSchema>;

export type TData = {
  organizationId: string;
  expertises: {
    operations: {
      name: string;
      id: string;
    }[];
    name: string;
    id: string;
  }[];
  plannings: {
    commandProject: { id: string; project: { name: string } };
    startDate: Date;
    endDate: Date;
    operation: {
      id: string;
      name: string;
    };
    operator: {
      id: string;
      name: string;
      image: string | null;
    };
  }[];
  name: string;
  id: string;
  createdAt: Date;
  users: {
    id: string;
    name: string;
  }[];
}[];

export type TOperator = {
  expertise: {
    id: string;
  }[];
  id: string;
  name: string;
  image: string | null;
};

export type TExpertise = {
  id: string;
  name: string;
};

export type TPlanning = {
  commandProject: {
    project: { id: string; name: string };
    id: string;
  };
  operation: {
    name: string;
    id: string;
  };
  id: string;
  operator: {
    name: string;
    id: string;
    image: string | null;
  };
  startDate: Date;
  endDate: Date;
};
