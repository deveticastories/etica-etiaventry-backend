import { z } from "zod";

const purchaseEntryProductSchema = z.object({
    productName: z
        .string()
        .trim()
        .min(1, "Product name is required"),
    minimumStockAlertQuantity: z
        .number()
        .min(0, "Minimum stock alert quantity cannot be negative")
        .default(0),
    purchaseQty: z
        .number()
        .int()
        .min(1, "Purchase quantity must be at least 1"),
    purchaseRate: z
        .number()
        .min(0, "Purchase rate cannot be negative"),
});

export const createPurchaseEntrySchema = z.object({
    purchaseDate: z.coerce.date(),
    vendor: z.string().refine(
        (value) => /^[0-9a-fA-F]{24}$/.test(value),
        "Invalid vendor ID",
    ),
    products: z
        .array(purchaseEntryProductSchema)
        .min(1, "At least one product is required"),
    totalIncludingGST: z
        .number()
        .min(0, "Total including GST cannot be negative"),
});

export const updatePurchaseEntrySchema = z.object({
    purchaseDate: z.coerce.date().optional(),
    vendor: z
        .string()
        .refine(
            (value) => /^[0-9a-fA-F]{24}$/.test(value),
            "Invalid vendor ID",
        )
        .optional(),
    products: z
        .array(purchaseEntryProductSchema)
        .min(1, "At least one product is required")
        .optional(),
    totalIncludingGST: z
        .number()
        .min(0, "Total including GST cannot be negative")
        .optional(),
    qcStatus: z.enum(["Pending", "Done"]).optional(),
});

export type CreatePurchaseEntryInput = z.infer<
    typeof createPurchaseEntrySchema
>;

export type UpdatePurchaseEntryInput = z.infer<
    typeof updatePurchaseEntrySchema
>;