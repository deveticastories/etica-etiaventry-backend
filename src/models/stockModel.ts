import mongoose, { Schema, type Document } from "mongoose";
import { BaseDocument, BaseSchema } from "./baseModel";

export interface Stock extends BaseDocument {
    product: mongoose.Types.ObjectId;
    minimumStockAlertQuantity: number;
    availableStockQuantity: number;
}

export type StockDocument = Stock & Document;

const StockSchema = new Schema<StockDocument>({
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
    availableStockQuantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
});

StockSchema.add(BaseSchema);

StockSchema.index(
    { product: 1 },
    {
        unique: true,
        partialFilterExpression: { isDeleted: false },
    },
);

const StockModel =
    mongoose.models.Stock ||
    mongoose.model<StockDocument>("Stock", StockSchema);

export default StockModel;
