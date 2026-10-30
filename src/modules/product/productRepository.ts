import mongoose from "mongoose";
import ProductModel, { type ProductDocument } from "../../models/productModel";
import { getPaginationMeta } from "../../utils/pagination";

export const create = async (
    productData: Partial<ProductDocument>,
): Promise<ProductDocument> => {
    const product = new ProductModel(productData);

    return await product.save();
};

export const findById = async (
    id: string,
): Promise<ProductDocument | null> => {
    return ProductModel.findOne({
        _id: id,
        isDeleted: false,
    }).exec();
};

export const updateById = async (
    id: string,
    updateData: Partial<ProductDocument>,
): Promise<ProductDocument | null> => {
    return ProductModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updateData },
        { returnDocument: "after", runValidators: true },
    ).exec();
};

export const getAllProducts = async (
    page: number,
    limit: number,
) => {
    const skip = (page - 1) * limit;

    const [products, totalRecords] = await Promise.all([
        ProductModel.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),

        ProductModel.countDocuments({ isDeleted: false }).exec(),
    ]);

    return {
        data: products,
        pagination: getPaginationMeta(page, limit, totalRecords),
    };
};

export const deleteProduct = async (
    productId: string,
    deletedBy: mongoose.Types.ObjectId,
): Promise<ProductDocument | null> => {
    return ProductModel.findOneAndUpdate(
        { _id: productId, isDeleted: false },
        {
            $set: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy,
            },
        },
        { new: true },
    ).exec();
};

export const changeProductStatus = async (
    id: string,
    updatedData: Partial<ProductDocument>,
): Promise<ProductDocument | null> => {
    return ProductModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
            $set: {
                status: updatedData.status,
            },
        },
        {
            new: true,
            runValidators: true,
        },
    ).exec();
};

export const findByName = async (
    name: string,
): Promise<ProductDocument | null> => {
    const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, "");

    return ProductModel.findOne({
        normalizedName,
        isDeleted: false,
    }).exec();
};