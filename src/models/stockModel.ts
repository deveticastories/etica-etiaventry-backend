import mongoose, { Schema, type Document } from "mongoose";
import { BaseDocument, BaseSchema } from "./baseModel";

export interface Stock extends BaseDocument {
    purchaseEntryProduct: mongoose.Types.ObjectId[];
    productName: string;
    minimumStockAlertQuantity: number;
    availableStockQuantity: number;
}

export type StockDocument = Stock & Document;

const StockSchema = new Schema<StockDocument>({
    purchaseEntryProduct: [
        {
            type: Schema.Types.ObjectId,
            required: true,
        },
    ],
    productName: {
        type: String,
        required: true,
        trim: true,
    },
    minimumStockAlertQuantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    availableStockQuantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
});

StockSchema.add(BaseSchema);

StockSchema.index(
    { productName: 1 },
    { unique: true },
);

const StockModel =
    mongoose.models.Stock ||
    mongoose.model<StockDocument>("Stock", StockSchema);

export default StockModel;