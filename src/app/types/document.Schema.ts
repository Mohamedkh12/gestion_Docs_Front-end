import { z } from "zod";

export const documentSchema = z.object({
    title: z
        .string()
        .min(3, "Le titre doit comporter au moins 3 caractères")
        .max(100, "Le titre ne doit pas dépasser 100 caractères"),
    description: z
        .string()
        .max(500, "La description ne doit pas dépasser 500 caractères")
        .optional()
        .or(z.literal("")),
    file: z
        .custom<File>((val) => val instanceof File, {
            message: "Le fichier est requis",
        }),
});

export type DocumentSchemaType = z.infer<typeof documentSchema>;
