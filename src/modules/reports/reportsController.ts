import type { Response } from "express";
import type { RequestWithAuthData } from "../../@types/express";
import * as reportsService from "./reportsService";
import { getPaginationParams } from "../../utils/pagination";
import { statusCode } from "../../constants/statusCode";
import { message } from "../../constants/responseMessage";
import { paginatedResponse } from "../../utils/response";

export const getAllPurchaseEntryReports = async (
    req: RequestWithAuthData,
    res: Response,
): Promise<Response> => {
    try {
        const { page, limit } = getPaginationParams(req.query);

        const { reports, pagination } =
            await reportsService.getAllPurchaseEntryReports(
                page,
                limit,
            );

        return res.status(statusCode.OK).json({
            ...paginatedResponse(reports, pagination),
            message: message.PURCHASE_ENTRY_REPORTS_FETCHED,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Page and limit must be positive integers"
        ) {
            return res.status(statusCode.BAD_REQUEST).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: message.INTERNAL_SERVER_ERROR,
        });
    }
};