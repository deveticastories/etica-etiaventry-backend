import { z } from "zod";

export const createProductSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Product name is required")
        .max(100, "Product name cannot exceed 100 characters"),
});

export const updateProductSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Product name is required")
        .max(100, "Product name cannot exceed 100 characters")
        .optional(),
});

export type CreateProductInput = z.infer<
    typeof createProductSchema
>;

export type UpdateProductInput = z.infer<
    typeof updateProductSchema
>;