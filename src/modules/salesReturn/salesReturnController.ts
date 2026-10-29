import type { Request, Response, NextFunction } from "express";
import {
    createSalesReturnService,
    getAllSalesReturnsService,
    getSalesReturnByIdService,
    updateSalesReturnService,
    deleteSalesReturnService,
    approveSalesReturnService,
} from "./salesReturnService";
import { message } from "../../constants/responseMessage";
import { statusCode } from "../../constants/statusCode";


export const createSalesReturnController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const data = await createSalesReturnService(req.body);

        res.status(statusCode.CREATED).json({
            success: true,
            message: message.SALES_RETURN_CREATED,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllSalesReturnsController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(
            Math.max(Number(req.query.limit) || 10, 1),
            100,
        );
        const search =
            typeof req.query.search === "string"
                ? req.query.search
                : undefined;

        const result = await getAllSalesReturnsService({
            page,
            limit,
            search,
        });

        res.status(statusCode.OK).json({
            success: true,
            message: message.SALES_RETURNS_FETCHED,
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};

export const getSalesReturnByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const data = await getSalesReturnByIdService(
            req.params.id as string,
        );

        res.status(statusCode.OK).json({
            success: true,
            message: message.SALES_RETURN_FETCHED,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const updateSalesReturnController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const data = await updateSalesReturnService(
            req.params.id as string,
            req.body,
        );

        res.status(statusCode.OK).json({
            success: true,
            message: message.SALES_RETURN_UPDATED,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteSalesReturnController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const data = await deleteSalesReturnService(
            req.params.id as string,
        );

        res.status(statusCode.OK).json({
            success: true,
            message: message.SALES_RETURN_DELETED,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const approveSalesReturnController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const data = await approveSalesReturnService(
            req.params.id as string,
        );

        res.status(statusCode.OK).json({
            success: true,
            message: message.SALES_RETURN_APPROVED,
            data,
        });
    } catch (error) {
        next(error);
    }
};