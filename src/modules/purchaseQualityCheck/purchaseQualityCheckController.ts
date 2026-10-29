
import type { Request, Response } from "express";
import type { RequestWithAuthData } from "../../@types/express";
import { statusCode } from "../../constants/statusCode";
import { message } from "../../constants/responseMessage";
import {
  createOrUpdateQualityCheckService,
  getAllQualityChecksService,
  getAllStockService,
  getQualityCheckByIdService,
} from "./purchaseQualityCheckService";
import { getPaginationParams } from "../../utils/pagination";
import { paginatedResponse } from "../../utils/response";

const getParamId = (id: string | string[]) =>
  Array.isArray(id) ? id[0] : id;

export const createOrUpdateQualityCheckController = async (
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

    const qualityCheck = await createOrUpdateQualityCheckService(
      req.body,
      req.userId.toString(),
    );

    return res.status(statusCode.OK).json({
      success: true,
      message: message.PURCHASE_QUALITY_CHECK_SUCCESS,
      data: qualityCheck,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : message.INTERNAL_SERVER_ERROR;

    let responseStatus = statusCode.BAD_REQUEST;

    if (errorMessage === message.PURCHASE_ENTRY_NOT_FOUND) {
      responseStatus = statusCode.NOT_FOUND;
    }

    return res.status(responseStatus).json({
      success: false,
      message: errorMessage,
    });
  }
};

export const getAllQualityChecksController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const qualityChecks = await getAllQualityChecksService();

    return res.status(statusCode.OK).json({
      success: true,
      message: message.PURCHASE_QUALITY_CHECK_FETCH_SUCCESS,
      data: qualityChecks,
    });
  } catch {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getQualityCheckByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = getParamId(req.params.id);

    const qualityCheck = await getQualityCheckByIdService(id);

    return res.status(statusCode.OK).json({
      success: true,
      message: message.PURCHASE_QUALITY_CHECK_FETCH_SUCCESS,
      data: qualityCheck,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : message.INTERNAL_SERVER_ERROR;

    const responseStatus =
      errorMessage === message.PURCHASE_QUALITY_CHECK_NOT_FOUND
        ? statusCode.NOT_FOUND
        : statusCode.BAD_REQUEST;

    return res.status(responseStatus).json({
      success: false,
      message: errorMessage,
    });
  }
};
export const getAllStockController = async (
    req: Request,
    res: Response,
) => {
    try {
        const { page, limit } = getPaginationParams(req.query);

        const search =
            typeof req.query.search === "string"
                ? req.query.search
                : undefined;

        const result = await getAllStockService({
            page,
            limit,
            search,
        });

        return res.status(200).json(
            paginatedResponse(result.data, result.pagination),
        );
    } catch (error) {
        console.error("Get stock error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch stock",
        });
    }
};