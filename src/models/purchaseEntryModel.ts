import mongoose, { Schema, type Document } from "mongoose";
import { BaseDocument, BaseSchema } from "./baseModel";

export type QCStatus = "Pending" | "Done";

export interface PurchaseEntryProduct {
    _id?: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
    minimumStockAlertQuantity: number;
    purchaseQty: number;
    purchaseRate: number;
    amount: number;
    qcStatus: QCStatus;
}

export interface PurchaseEntry extends BaseDocument {
    invoiceNo: string;
    purchaseDate: Date;
    vendor: mongoose.Types.ObjectId;
    store?: mongoose.Types.ObjectId;
    products: PurchaseEntryProduct[];
    totalProductQty: number;
    totalAmount: number;
    totalIncludingGST: number;
}

export type PurchaseEntryDocument = PurchaseEntry & Document;

const PurchaseEntryProductSchema = new Schema<PurchaseEntryProduct>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
       
        minimumStockAlertQuantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        purchaseQty: {
            type: Number,
            required: true,
            min: 1,
        },
        purchaseRate: {
            type: Number,
            required: true,
            min: 0,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        qcStatus: {
            type: String,
            enum: ["Pending", "Done"],
            default: "Pending",
            required: true,
        },
    },
    {
        _id: true,
    },
);

const PurchaseEntrySchema = new Schema<PurchaseEntryDocument>(
    {
        invoiceNo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        purchaseDate: {
            type: Date,
            required: true,
        },
        vendor: {
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        store: {
            type: Schema.Types.ObjectId,
            ref: "Store",
        },
        products: {
            type: [PurchaseEntryProductSchema],
            required: true,
            validate: {
                validator: (products: PurchaseEntryProduct[]) =>
                    products.length > 0,
                message: "At least one product is required",
            },
        },
        totalProductQty: {
            type: Number,
            required: true,
            min: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        totalIncludingGST: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        ...BaseSchema,
        timestamps: true,
    },
);

const PurchaseEntryModel = mongoose.model<PurchaseEntryDocument>(
    "PurchaseEntry",
    PurchaseEntrySchema,
);

export default PurchaseEntryModel;
