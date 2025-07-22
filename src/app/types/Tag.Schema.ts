import { z } from "zod";

export const tagSchema = z.object({
    name: z.string().min(1, "Le nom est obligatoire")
        .max(50, "Le nom est trop long"),
    description: z.string().max(225, "La description ne peut pas dépasser 225 caractères")
        .optional()
        .or(z.literal("")),
    color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Couleur invalide"),
});
