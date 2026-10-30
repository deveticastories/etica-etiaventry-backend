import { Response } from "express";
import * as productService from "./productService";
import { RequestWithAuthData } from "../../@types/express";
import { message } from "../../constants/responseMessage";
import { statusCode } from "../../constants/statusCode";
import { paginatedResponse } from "../../utils/response";
import { getPaginationParams } from "../../utils/pagination";

export const createProduct = async (
    req: RequestWithAuthData,
    res: Response,
) => {
    try {
        if (!req.userId) {
            return res.status(statusCode.UNAUTHORIZED).json({
                success: false,
                message: message.UNAUTHORIZED,
            });
        }

        const productData = {
            ...req.body,
            createdBy: req.userId,
        };

        const createdProduct = await productService.createProduct(productData);

        return res.status(statusCode.CREATED).json({
            success: true,
            message: message.PRODUCT_CREATED,
            product: createdProduct,
        });
    } catch (error: unknown) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : message.INTERNAL_SERVER_ERROR,
        });
    }
};

export const editProduct = async (
    req: RequestWithAuthData,
    res: Response,
) => {
    const { id } = req.params;

    if (!req.userId) {
        return res.status(statusCode.UNAUTHORIZED).json({
            success: false,
            message: message.UNAUTHORIZED,
        });
    }

    if (typeof id !== "string") {
        return res.status(statusCode.BAD_REQUEST).json({
            success: false,
            message: message.INVALID_PRODUCT_ID,
        });
    }

    try {
        const existingProduct = await productService.getProductById(id);

        if (!existingProduct) {
            return res.status(statusCode.NOT_FOUND).json({
                success: false,
                message: message.PRODUCT_NOT_FOUND,
            });
        }

        const productData = {
            ...req.body,
            updatedBy: req.userId,
            userUpdatedDate: new Date(),
        };

        const updatedProduct = await productService.editProduct(
            id,
            productData,
        );

        return res.status(statusCode.OK).json({
            success: true,
            message: message.PRODUCT_UPDATED,
            product: updatedProduct,
        });
    } catch (error: unknown) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : message.INTERNAL_SERVER_ERROR,
        });
    }
};

export const deleteProduct = async (
    req: RequestWithAuthData,
    res: Response,
) => {
    const { id } = req.params;

    try {
        if (!req.userId) {
            return res.status(statusCode.UNAUTHORIZED).json({
                success: false,
                message: message.UNAUTHORIZED,
            });
        }

        if (typeof id !== "string") {
            return res.status(statusCode.BAD_REQUEST).json({
                success: false,
                message: message.INVALID_PRODUCT_ID,
            });
        }

        const deletedProduct = await productService.deleteProduct(
            id,
            req.userId,
        );

        if (!deletedProduct) {
            return res.status(statusCode.NOT_FOUND).json({
                success: false,
                message: message.PRODUCT_NOT_FOUND,
            });
        }

        return res.status(statusCode.OK).json({
            success: true,
            message: message.PRODUCT_DELETED,
        });
    } catch (error: unknown) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : message.INTERNAL_SERVER_ERROR,
        });
    }
};

export const getProductById = async (
    req: RequestWithAuthData,
    res: Response,
) => {
    const { id } = req.params;

    try {
        if (!req.userId) {
            return res.status(statusCode.UNAUTHORIZED).json({
                success: false,
                message: message.UNAUTHORIZED,
            });
        }

        if (typeof id !== "string") {
            return res.status(statusCode.BAD_REQUEST).json({
                success: false,
                message: message.INVALID_PRODUCT_ID,
            });
        }

        const product = await productService.getProductById(id);

        if (!product) {
            return res.status(statusCode.NOT_FOUND).json({
                success: false,
                message: message.PRODUCT_NOT_FOUND,
            });
        }

        return res.status(statusCode.OK).json({
            success: true,
            product,
        });
    } catch (error: unknown) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : message.INTERNAL_SERVER_ERROR,
        });
    }
};

export const getAllProducts = async (
    req: RequestWithAuthData,
    res: Response,
) => {
    try {
        if (!req.userId) {
            return res.status(statusCode.UNAUTHORIZED).json({
                success: false,
                message: message.UNAUTHORIZED,
            });
        }

        let paginationParams;

        try {
            paginationParams = getPaginationParams(req.query);
        } catch (error: unknown) {
            return res.status(statusCode.BAD_REQUEST).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : message.INVALID_PAGINATION,
            });
        }

        const result = await productService.getAllProducts(
            paginationParams.page,
            paginationParams.limit,
        );

        return res.status(statusCode.OK).json(
            paginatedResponse(result.data, result.pagination),
        );
    } catch (error: unknown) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : message.INTERNAL_SERVER_ERROR,
        });
    }
};

export const updateProductStatus = async (
    req: RequestWithAuthData,
    res: Response,
) => {
    const { id } = req.params;

    if (!req.userId) {
        return res.status(statusCode.UNAUTHORIZED).json({
            success: false,
            message: message.UNAUTHORIZED,
        });
    }

    if (typeof id !== "string") {
        return res.status(statusCode.BAD_REQUEST).json({
            success: false,
            message: message.INVALID_PRODUCT_ID,
        });
    }

    try {
        const productStatusUpdateData = {
            ...req.body,
            updatedBy: req.userId,
            userUpdatedDate: new Date(),
        };

        const updatedProduct = await productService.updateProductStatus(
            id,
            productStatusUpdateData,
        );

        if (!updatedProduct) {
            return res.status(statusCode.NOT_FOUND).json({
                success: false,
                message: message.PRODUCT_NOT_FOUND,
            });
        }

        return res.status(statusCode.OK).json({
            success: true,
            message: message.PRODUCT_STATUS_UPDATED,
            product: updatedProduct,
        });
    } catch (error: unknown) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : message.INTERNAL_SERVER_ERROR,
        });
    }
};