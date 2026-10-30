import mongoose, { Schema, type Document } from "mongoose";
import { BaseDocument, BaseSchema } from "./baseModel";

export interface StockBatch extends BaseDocument {
    product: mongoose.Types.ObjectId;
    vendor: mongoose.Types.ObjectId;
    purchaseEntry: mongoose.Types.ObjectId;
    purchaseEntryProduct: mongoose.Types.ObjectId;
    store?: mongoose.Types.ObjectId;
    purchaseRate: number;
    purchaseQty: number;
    approvedQty: number;
    remainingQty: number;
    purchaseDate: Date;
}

export type StockBatchDocument = StockBatch & Document;

const StockBatchSchema = new Schema<StockBatchDocument>({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    vendor: {
        type: Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
    },
    purchaseEntry: {
        type: Schema.Types.ObjectId,
        ref: "PurchaseEntry",
        required: true,
    },
    purchaseEntryProduct: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    store: {
        type: Schema.Types.ObjectId,
        ref: "Store",
    },
    purchaseRate: {
        type: Number,
        required: true,
        min: 0,
    },
    purchaseQty: {
        type: Number,
        required: true,
        min: 1,
    },
    approvedQty: {
        type: Number,
        required: true,
        min: 0,
    },
    remainingQty: {
        type: Number,
        required: true,
        min: 0,
    },
    purchaseDate: {
        type: Date,
        required: true,
    },
});

StockBatchSchema.add(BaseSchema);

StockBatchSchema.index(
    { purchaseEntryProduct: 1 },
    {
        unique: true,
        partialFilterExpression: { isDeleted: false },
    },
);

StockBatchSchema.index({ product: 1, purchaseDate: 1 });

const StockBatchModel =
    mongoose.models.StockBatch ||
    mongoose.model<StockBatchDocument>("StockBatch", StockBatchSchema);

export default StockBatchModel;
