import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome completo é obrigatório")
      .min(3, "O nome deve ter no mínimo 3 caracteres")
      .max(100, "O nome deve ter no máximo 100 caracteres"),
    email: z
      .string()
      .min(1, "E-mail é obrigatório")
      .email("Informe um e-mail válido"),
    password: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(6, "A senha deve ter no mínimo 6 caracteres")
      .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
