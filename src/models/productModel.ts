import mongoose, { Schema, type Document } from "mongoose";
import { BaseDocument, BaseSchema } from "./baseModel";

export interface Product extends BaseDocument {
    name: string;
    normalizedName: string;
}

export type ProductDocument = Product & Document;

export const normalizeProductName = (name: string): string =>
    name.toLowerCase().replace(/[^a-z0-9]/g, "");

const ProductSchema = new Schema<ProductDocument>({
    ...BaseSchema.obj,
    name: {
        type: String,
        required: true,
        trim: true,
    },
    normalizedName: {
        type: String,
        required: true,
        select: false,
    },
} as mongoose.SchemaDefinition<ProductDocument>);

ProductSchema.pre("validate", function () {
    if (this.name) {
        this.name = this.name.trim();
        this.normalizedName = normalizeProductName(this.name);
    }
});

ProductSchema.index(
    { normalizedName: 1 },
    { unique: true },
);

const ProductModel =
    mongoose.models.Product ||
    mongoose.model<ProductDocument>("Product", ProductSchema);

export default ProductModel;