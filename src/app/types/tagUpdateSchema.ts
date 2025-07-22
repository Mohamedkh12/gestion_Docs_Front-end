import { z } from "zod";

export const tagUpdateSchema = z.object({
    name: z
        .string()
        .max(50, "Le nom ne peut pas dépasser 50 caractères")
        .optional()
        .or(z.literal("")),
    description: z
        .string()
        .max(225, "La description ne peut pas dépasser 225 caractères")
        .optional()
        .or(z.literal("")),
});
