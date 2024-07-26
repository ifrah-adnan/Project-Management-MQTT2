import { Session, getServerSession } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";

export type FieldErrors<T> = Partial<Record<keyof T, string[]>>;

export class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomError";
  }
}

export type Action<TInput, TOutput> = (
  data: TInput,
  formData?: FormData
) => Promise<{
  result?: TOutput;
  fieldErrors?: FieldErrors<TInput>;
  error?: string;
}>;

type CreateSafeActionOptions<TInput extends object, TOutput> = {
  scheme: z.Schema<TInput>;
  handler: (
    data: TInput,
    session?: Session | null,
    formData?: FormData | null
  ) => Promise<TOutput>;
  auth?: boolean;
  admin?: boolean;
};

export function createSafeAction<TInput extends object, TOutput>({
  scheme,
  handler,
  auth,
  admin,
}: CreateSafeActionOptions<TInput, TOutput>): Action<TInput, TOutput> {
  return async (data, formData) => {
    let session: Session | null = null;
    if (auth) {
      session = await getServerSession();
      if (!session) {
        return {
          error: "You must be signed in to perform this action",
        };
      }
      if (admin && session.user.role !== 'SYS_ADMIN' && session.user.role !== 'ADMIN') {
        return {
          error: "You do not have permission to perform this action",
        };
      }
    }
    try {
      const parsed = scheme.safeParse(data);
      if (!parsed.success) {
        return {
          error: "Invalid input",
          fieldErrors: parsed.error.flatten().fieldErrors as FieldErrors<TInput>,
        };
      }
      const result = await handler(parsed.data, session, formData);
      return { result };
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const field = error.meta?.target as keyof TInput;
          if (field === "email") {
            return {
              error: "Email already in use",
              fieldErrors: {
                email: ["This email is already registered"],
              } as FieldErrors<TInput>,
            };
          } else if (field === "name" && 'organizationName' in data) {
            return {
              error: "Organization name already taken",
              fieldErrors: {
                organizationName: ["This organization name is already taken"],
              } as FieldErrors<TInput>,
            };
          } else {
            return {
              error: "A conflict was detected. Please try again with different information.",
              fieldErrors: {
                [field]: ["This field must be unique"],
              } as FieldErrors<TInput>,
            };
          }
        }
      }
      if (error instanceof CustomError) {
        return {
          error: error.message,
        };
      }
      return {
        error: "An unexpected error occurred. Please try again later.",
      };
    }
  };
}