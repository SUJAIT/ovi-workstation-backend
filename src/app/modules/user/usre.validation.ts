import { z } from "zod";

const createUserValidationSchema = z.object({
  body: z.object({
    firebaseUid: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
    role: z.enum(["user", "admin", "super_admin"]).optional(),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
};