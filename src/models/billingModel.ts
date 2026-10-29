import mongoose, { Schema, type Document } from "mongoose";
import { BaseDocument, BaseSchema } from "./baseModel";

export interface BillingProduct {
    stock: mongoose.Types.ObjectId;
    productName: string;
    availableQty: number;
    qty: number;
    sellingPrice: number;
}

export interface Billing extends BaseDocument {
    invoiceNo: string;
    date: Date;
    customer: mongoose.Types.ObjectId;
    defaultMargin: number;
    products: mongoose.Types.DocumentArray<BillingProduct>;
    totalQty: number;
    invoiceTotal: number;
    isPaymentReceived: boolean;
}

export type BillingDocument = Billing & Document;

const BillingProductSchema = new Schema<BillingProduct>(
    {
        stock: {
            type: Schema.Types.ObjectId,
            ref: "Stock",
            required: true,
        },
        productName: {
            type: String,
            required: true,
            trim: true,
        },
        availableQty: {
            type: Number,
            required: true,
            min: 0,
        },
        qty: {
            type: Number,
            required: true,
            min: 1,
        },
        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: true },
);

const BillingSchema = new Schema<BillingDocument>({
    invoiceNo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    defaultMargin: {
        type: Number,
        required: true,
        min: 0,
        default: 25,
    },
    products: {
        type: [BillingProductSchema],
        required: true,
        validate: {
            validator: (products: BillingProduct[]) =>
                products.length > 0,
            message: "At least one product is required",
        },
    },
    totalQty: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    invoiceTotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    isPaymentReceived: {
        type: Boolean,
        default: false,
    },
});

BillingSchema.add(BaseSchema);

const BillingModel =
    mongoose.models.Billing ||
    mongoose.model<BillingDocument>("Billing", BillingSchema);

export default BillingModel;