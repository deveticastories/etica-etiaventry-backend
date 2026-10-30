import logger from "../../utils/logger";
import * as productRepository from "./productRepository";
import { type ProductDocument } from "../../models/productModel";
import mongoose from "mongoose";

const normalizeProductName = (name: string): string =>
    name.toLowerCase().replace(/[^a-z0-9]/g, "");

export const createProduct = async (
    productData: Partial<ProductDocument>,
): Promise<ProductDocument> => {
    try {
        logger.info("Creating a new product", { productData });

        if (productData.name) {
            const normalizedName = normalizeProductName(productData.name);

            const existingProduct = await productRepository.findByName(
                productData.name,
            );

            if (existingProduct) {
                throw new Error(
                    `Product with name '${productData.name}' already exists.`,
                );
            }

            productData.name = productData.name.trim();
            productData.normalizedName = normalizedName;
        }

        const newProduct = await productRepository.create(productData);

        logger.info("Product created successfully", {
            productId: newProduct._id,
            name: newProduct.name,
        });

        return newProduct;
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Failed to create product.";

        logger.error("Error creating product", {
            error: errorMessage,
        });

        throw new Error(errorMessage);
    }
};

export const editProduct = async (
    productId: string,
    productData: Partial<ProductDocument>,
): Promise<ProductDocument | null> => {
    try {
        logger.info(`Editing product with ID ${productId}`, { productData });

        if (productData.name) {
            const normalizedName = normalizeProductName(productData.name);

            const existingProduct = await productRepository.findByName(
                productData.name,
            );

            if (
                existingProduct &&
                existingProduct._id.toString() !== productId
            ) {
                throw new Error(
                    `Product with name '${productData.name}' already exists.`,
                );
            }

            productData.name = productData.name.trim();
            productData.normalizedName = normalizedName;
        }

        const updatedProduct = await productRepository.updateById(
            productId,
            productData,
        );

        if (!updatedProduct) {
            throw new Error(`Product with ID ${productId} not found.`);
        }

        logger.info("Product updated successfully", {
            productId: updatedProduct._id,
            name: updatedProduct.name,
        });

        return updatedProduct;
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Failed to update product.";

        logger.error("Error updating product", {
            productId,
            error: errorMessage,
        });

        throw new Error(errorMessage);
    }
};

export const getAllProducts = async (
    page: number,
    limit: number,
) => {
    logger.info("Getting products with pagination", { page, limit });

    return productRepository.getAllProducts(page, limit);
};

export const getProductById = async (
    id: string,
): Promise<ProductDocument | null> => {
    logger.info(`Getting product with ID ${id}`);

    return productRepository.findById(id);
};

export const deleteProduct = async (
    productId: string,
    deletedBy: mongoose.Types.ObjectId,
): Promise<ProductDocument | null> => {
    try {
        logger.info(`Deleting product with ID ${productId}`);

        const deletedProduct = await productRepository.deleteProduct(
            productId,
            deletedBy,
        );

        if (!deletedProduct) {
            throw new Error(`Product with ID ${productId} not found.`);
        }

        logger.info("Product deleted successfully", { productId });

        return deletedProduct;
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Failed to delete product.";

        logger.error("Error deleting product", {
            productId,
            error: errorMessage,
        });

        throw new Error(errorMessage);
    }
};

export const updateProductStatus = async (
    id: string,
    updatedData: Partial<ProductDocument>,
): Promise<ProductDocument | null> => {
    try {
        logger.info(
            `Updating status for product with ID ${id} to ${updatedData.status}`,
        );

        const updatedProduct = await productRepository.changeProductStatus(
            id,
            updatedData,
        );

        if (!updatedProduct) {
            throw new Error(`Product with ID ${id} not found.`);
        }

        logger.info("Product status updated successfully", {
            productId: id,
            status: updatedData.status,
        });

        return updatedProduct;
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Failed to update product status.";

        logger.error("Error updating product status", {
            productId: id,
            error: errorMessage,
        });

        throw new Error(errorMessage);
    }
};