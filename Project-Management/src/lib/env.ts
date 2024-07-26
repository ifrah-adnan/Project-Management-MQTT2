import { z } from "zod";

// DATABASE_URL="postgresql://postgres:postgres@localhost:5432/project-management?schema=public"
// JWT_SECRET="mysecretkey"
const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .default(
      "postgresql://postgres:postgres@localhost:5432/project-management?schema=public"
    ),
  JWT_SECRET: z.string().default("secret"),
  EXPIRY_TIME: z.string().transform((val) => parseInt(val, 10)).default("7200"),
});

const env = envSchema.parse(process.env);

export default env;
