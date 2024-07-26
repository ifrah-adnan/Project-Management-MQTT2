import { Role, Status } from "@prisma/client";
import { join } from "path";
import { z } from "zod";

export const staticDir = join(process.cwd(), "static");

export const projectsStatus: Status[] = [
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
] as const;

export const roles = [
  "ADMIN",
  "USER",
  "SYS_ADMIN",
  "CLIENT",
  "OPERATOR",
] as const;

export const roleSchema = z.enum(roles);
