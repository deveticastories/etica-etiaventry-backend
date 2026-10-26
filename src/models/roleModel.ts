
import mongoose, { Schema, type Document } from "mongoose";
import { BaseDocument, BaseSchema } from "./baseModel";

export const ROLE_MODULES = [
    "Dashboard",
    "Staff",
    "Roles",
    "Vendors",
    "Store",
    "Customer Master",
    "Item Master",
    "Quality Check",
    "Purchase Data",
    "Store Stock",
    "Billing",
    "Sales Returns",
    "Daily Expenses",
    "Payment Entry",
    "Receipt Entry",
    "Reports",
] as const;

export type RoleModule = (typeof ROLE_MODULES)[number];

export interface Role extends BaseDocument {
    roleName: string;
    modules?: RoleModule[];
}

export type RoleDocument = Role & Document;

const RoleSchema = new Schema<RoleDocument>({
    ...BaseSchema.obj,
    roleName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    modules: {
        type: [String],
        enum: ROLE_MODULES,
        default: ["Dashboard"],
    },
} as mongoose.SchemaDefinition<RoleDocument>);

const RoleModel = mongoose.model<RoleDocument>(
    "Role",
    RoleSchema,
);

export default RoleModel;
