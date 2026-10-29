import mongoose, { Schema, type Document } from "mongoose";
import { BaseDocument, BaseSchema } from "./baseModel";

export type SalesReturnType = "Full" | "Partial";
export type SalesReturnReason = "Size Issue" | "Damage" | "Other";

export interface SalesReturn extends BaseDocument {
    bill: mongoose.Types.ObjectId;
    billingProductId: mongoose.Types.ObjectId;
    returnType: SalesReturnType;
    reason: SalesReturnReason;
    returnQuantity: number;
    invoiceValue: number;
    updatedInvoiceValue: number;
    isApproved: boolean;
}

export type SalesReturnDocument = SalesReturn & Document;

const SalesReturnSchema = new Schema<SalesReturnDocument>({
    bill: {
        type: Schema.Types.ObjectId,
        ref: "Billing",
        required: true,
    },
    billingProductId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    returnType: {
        type: String,
        enum: ["Full", "Partial"],
        required: true,
    },
    reason: {
        type: String,
        enum: ["Size Issue", "Damage", "Other"],
        required: true,
    },
    returnQuantity: {
        type: Number,
        required: true,
        min: 1,
    },
    invoiceValue: {
        type: Number,
        min: 0,
    },
    updatedInvoiceValue: {
        type: Number,
        min: 0,
    },
    isApproved: {
        type: Boolean,
        default: function (this: SalesReturnDocument) {
            return this.reason === "Size Issue" || this.reason === "Other"
                ? false
                : true;
        },
    },
});

SalesReturnSchema.add(BaseSchema);

const SalesReturnModel = mongoose.model<SalesReturnDocument>(
    "SalesReturn",
    SalesReturnSchema,
);

export default SalesReturnModel;