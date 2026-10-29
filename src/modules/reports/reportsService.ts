import * as reportsRepository from "./reportsRepository";
import { getPaginationMeta } from "../../utils/pagination";

export const getAllPurchaseEntryReports = async (
    page: number,
    limit: number,
) => {
    const skip = (page - 1) * limit;

    const { reports, totalRecords } =
        await reportsRepository.getAllPurchaseEntryReports(
            skip,
            limit,
        );

    const pagination = getPaginationMeta(
        page,
        limit,
        totalRecords,
    );

    return {
        reports,
        pagination,
    };
};
export const getAllDebitReportsService = async (
    page: number,
    limit: number,
) => {
    return reportsRepository.findAllDebitReports(page, limit);
};


export const getAllDamageProductReportsService = async (
    page: number,
    limit: number,
) => {
    const { data, totalRecords } =
        await reportsRepository.findAllDamageProductReports(
            page,
            limit,
        );

    return {
        data,
        pagination: getPaginationMeta(page, limit, totalRecords),
    };
};