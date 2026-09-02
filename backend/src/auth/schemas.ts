import { z } from "zod";

// max(72): bcrypt silently truncates anything past 72 bytes, so a longer
// input would create a false sense of a stronger password than is actually hashed.
export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(72),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});
