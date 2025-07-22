import { z } from "zod";

export const categorySchema = z.object({
    nomCat: z.string().min(1, "Le nom est obligatoire")
        .max(50, "Le nom est trop long"),
    description: z.string().max(225, "La description ne peut pas dépasser 225 caractères")
        .optional()
        .or(z.literal("")),
});
