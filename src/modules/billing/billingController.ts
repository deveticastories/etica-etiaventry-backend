import type { Response } from "express";
import mongoose from "mongoose";
import type { RequestWithAuthData } from "../../@types/express";
import * as billingService from "./billingService";
import { getPaginationParams } from "../../utils/pagination";
import { statusCode } from "../../constants/statusCode";
import { message } from "../../constants/responseMessage";

const getBillingId = (
    req: RequestWithAuthData,
    res: Response,
): string | null => {
    const id = req.params.id;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        res.status(statusCode.BAD_REQUEST).json({
            success: false,
            message: message.BILLING_ID_INVALID,
        });

        return null;
    }

    return id;
};

const getErrorResponse = (error: unknown) => {
    if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        typeof error.statusCode === "number" &&
        "message" in error &&
        typeof error.message === "string"
    ) {
        return {
            status: error.statusCode,
            message: error.message,
        };
    }

    if (error instanceof Error) {
        const errorMap: Record<
            string,
            { status: number; message: string }
        > = {
            BILLING_ID_INVALID: {
                status: statusCode.BAD_REQUEST,
                message: message.BILLING_ID_INVALID,
            },
            BILLING_CUSTOMER_INVALID: {
                status: statusCode.BAD_REQUEST,
                message: message.BILLING_CUSTOMER_INVALID,
            },
            BILLING_PRODUCTS_REQUIRED: {
                status: statusCode.BAD_REQUEST,
                message: message.BILLING_PRODUCTS_REQUIRED,
            },
            BILLING_PRODUCT_INVALID: {
                status: statusCode.BAD_REQUEST,
                message: message.BILLING_PRODUCT_INVALID,
            },
            BILLING_INSUFFICIENT_STOCK: {
                status: statusCode.BAD_REQUEST,
                message: message.BILLING_INSUFFICIENT_STOCK,
            },
            BILLING_NOT_FOUND: {
                status: statusCode.NOT_FOUND,
                message: message.BILLING_NOT_FOUND,
            },
        };

        const result = errorMap[error.message];

        if (result) {
            return result;
        }
    }

    return {
        status: statusCode.INTERNAL_SERVER_ERROR,
        message: message.BILLING_OPERATION_FAILED,
    };
};

export const createBilling = async (
    req: RequestWithAuthData,
    res: Response,
): Promise<Response> => {
    try {
        if (
            !req.userId ||
            !mongoose.isValidObjectId(req.userId)
        ) {
            return res.status(statusCode.UNAUTHORIZED).json({
                success: false,
                message: message.AUTHENTICATED_USER_ID_INVALID,
            });
        }

        const billing = await billingService.createBillingService(
            req.body,
            new mongoose.Types.ObjectId(req.userId),
        );

        return res.status(statusCode.CREATED).json({
            success: true,
            message: message.BILLING_CREATED,
            data: billing,
        });
    } catch (error) {
        const result = getErrorResponse(error);

        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
};

export const getAllBillings = async (
    req: RequestWithAuthData,
    res: Response,
): Promise<Response> => {
    try {
        const { page, limit } = getPaginationParams(req.query);

        const search =
            typeof req.query.search === "string"
                ? req.query.search
                : undefined;

        const result = await billingService.getAllBillingsService(
            page,
            limit,
            search,
        );

        return res.status(statusCode.OK).json({
            success: true,
            message: message.BILLINGS_FETCHED,
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        const result = getErrorResponse(error);

        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
};

export const getBillingById = async (
    req: RequestWithAuthData,
    res: Response,
): Promise<Response> => {
    const id = getBillingId(req, res);

    if (!id) {
        return res;
    }

    try {
        const billing = await billingService.getBillingByIdService(id);

        if (!billing) {
            return res.status(statusCode.NOT_FOUND).json({
                success: false,
                message: message.BILLING_NOT_FOUND,
            });
        }

        return res.status(statusCode.OK).json({
            success: true,
            message: message.BILLING_FETCHED,
            data: billing,
        });
    } catch (error) {
        const result = getErrorResponse(error);

        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
};
export const updateBillingPaymentStatus = async (
    req: RequestWithAuthData,
    res: Response,
): Promise<Response> => {
    const id = getBillingId(req, res);

    if (!id) {
        return res;
    }

    try {
        const { isPaymentReceived } = req.body;

        if (typeof isPaymentReceived !== "boolean") {
            return res.status(statusCode.BAD_REQUEST).json({
                success: false,
                message: message.BILLING_PAYMENT_STATUS_INVALID,
            });
        }

        const billing =
            await billingService.updateBillingPaymentStatusService(
                id,
                isPaymentReceived,
            );

        return res.status(statusCode.OK).json({
            success: true,
            message: message.BILLING_PAYMENT_STATUS_UPDATED,
            data: billing,
        });
    } catch (error) {
        const result = getErrorResponse(error);

        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
}