import mongoose from "mongoose";
import {
    createSalesReturn,
    findAllSalesReturns,
    findSalesReturnById,
    updateSalesReturn,
    softDeleteSalesReturn,
    approveSalesReturnAndRestoreStock,
} from "./salesReturnRepository";
import type { SalesReturn } from "../../models/salesReturnModel";
import { message } from "../../constants/responseMessage";


interface GetAllSalesReturnsParams {
    page: number;
    limit: number;
    search?: string;
}

export const createSalesReturnService = async (
    data: Partial<SalesReturn>,
) => {
    if (!data.bill || !mongoose.isValidObjectId(data.bill)) {
        throw {
            statusCode: 400,
            message: message.INVALID_ID,
        };
    }

    return createSalesReturn(data as Record<string, unknown>);
};

export const getAllSalesReturnsService = async ({
    page,
    limit,
    search,
}: GetAllSalesReturnsParams) => {
    const { data, totalRecords } = await findAllSalesReturns({
        page,
        limit,
        search,
    });

    const totalPages = Math.ceil(totalRecords / limit);

    return {
        data,
        pagination: {
            currentPage: page,
            limit,
            totalRecords,
            totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
        },
    };
};

export const getSalesReturnByIdService = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw {
            statusCode: 400,
            message: message.INVALID_ID,
        };
    }

    const salesReturn = await findSalesReturnById(id);

    if (!salesReturn) {
        throw {
            statusCode: 404,
            message: message.SALES_RETURN_NOT_FOUND,
        };
    }

    return salesReturn;
};

export const updateSalesReturnService = async (
    id: string,
    data: Partial<SalesReturn>,
) => {
    if (!mongoose.isValidObjectId(id)) {
        throw {
            statusCode: 400,
            message: message.INVALID_ID,
        };
    }

    if (data.isApproved !== undefined) {
        throw {
            statusCode: 400,
            message: message.SALES_RETURN_APPROVAL_SEPARATE,
        };
    }

    const salesReturn = await updateSalesReturn(
        id,
        data as Record<string, unknown>,
    );

    if (!salesReturn) {
        throw {
            statusCode: 404,
            message: message.SALES_RETURN_NOT_FOUND,
        };
    }

    return salesReturn;
};

export const deleteSalesReturnService = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw {
            statusCode: 400,
            message: message.INVALID_ID,
        };
    }

    const salesReturn = await softDeleteSalesReturn(id);

    if (!salesReturn) {
        throw {
            statusCode: 404,
            message: message.SALES_RETURN_NOT_FOUND,
        };
    }

    return salesReturn;
};

export const approveSalesReturnService = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw {
            statusCode: 400,
            message: message.INVALID_ID,
        };
    }

    return approveSalesReturnAndRestoreStock(id);
};