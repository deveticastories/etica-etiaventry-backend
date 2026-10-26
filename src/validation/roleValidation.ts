import { z } from "zod";
import { message } from "../constants/responseMessage";
import { ROLE_MODULES } from "../models/roleModel";

export const createRoleValidation = z.object({
    roleName: z
        .string()
        .trim()
        .min(1, message.ROLE_NAME_REQUIRED),

    modules: z
        .array(
            z.enum(ROLE_MODULES, {
                error: message.ROLE_MODULE_INVALID,
            }),
        )
        .min(1, message.ROLE_MODULES_REQUIRED),
});

export const updateRoleValidation = z.object({
    roleName: z
        .string()
        .trim()
        .min(1, message.ROLE_NAME_REQUIRED)
        .optional(),

    modules: z
        .array(
            z.enum(ROLE_MODULES, {
                error: message.ROLE_MODULE_INVALID,
            }),
        )
        .min(1, message.ROLE_MODULES_REQUIRED)
        .optional(),
});

export const updateRoleStatusValidation = z.object({
    status: z.boolean({
        error: message.STATUS_MUST_BE_BOOLEAN,
    }),
});

export type CreateRoleInput = z.infer<typeof createRoleValidation>;
export type UpdateRoleInput = z.infer<typeof updateRoleValidation>;
export type UpdateRoleStatusInput = z.infer<
    typeof updateRoleStatusValidation
>;