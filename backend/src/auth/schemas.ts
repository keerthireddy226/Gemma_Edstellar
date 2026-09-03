import { z } from "zod";

// max(72): bcrypt silently truncates anything past 72 bytes, so a longer
// input would create a false sense of a stronger password than is actually hashed.
export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

// A login portal names which role(s) it accepts — a plain list, even when
// there's only one — so a portal like /admin/login can accept either
// 'admin' or 'super_admin' without a different check shape.
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  allowedRoles: z.array(z.enum(["learner", "org_admin", "admin", "super_admin"])).min(1),
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
