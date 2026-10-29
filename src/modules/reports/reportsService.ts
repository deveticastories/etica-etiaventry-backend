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