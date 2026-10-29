import mongoose from "mongoose";
import PurchaseEntryModel from "../../models/purchaseEntryModel";
import PurchaseQualityCheckModel from "../../models/purchaseQualityCheckModel";
import PaymentEntryModel from "../../models/paymentEntryModel";
import DailyExpenseModel from "../../models/dailyExpenseModel";
import VendorModel from "../../models/vendorModel";
import { getPaginationMeta } from "../../utils/pagination";
import SalesReturnModel from "../../models/salesReturnModel";

export const getAllPurchaseEntryReports = async (
    skip: number,
    limit: number,
) => {
    const [purchaseEntries, totalRecords] = await Promise.all([
        PurchaseEntryModel.find({ isDeleted: false })
            .populate("vendor")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        PurchaseEntryModel.countDocuments({ isDeleted: false }),
    ]);

    if (purchaseEntries.length === 0) {
        return {
            reports: [],
            totalRecords,
        };
    }

    const purchaseEntryIds = purchaseEntries.map((entry) => entry._id);

    const [qualityChecks, paymentEntries] = await Promise.all([
        PurchaseQualityCheckModel.find({
            purchaseEntry: { $in: purchaseEntryIds },
            isDeleted: false,
        }).populate("checkedBy"),
        PaymentEntryModel.find({
            purchaseInvoice: { $in: purchaseEntryIds },
            isDeleted: false,
        }).sort({ createdAt: -1 }),
    ]);

    const qualityCheckMap = new Map(
        qualityChecks.map((qualityCheck) => [
            qualityCheck.purchaseEntry.toString(),
            qualityCheck,
        ]),
    );

    const paymentEntriesMap = new Map<string, typeof paymentEntries>();

    for (const paymentEntry of paymentEntries) {
        const purchaseEntryId =
            paymentEntry.purchaseInvoice.toString();

        const existingPayments =
            paymentEntriesMap.get(purchaseEntryId) ?? [];

        existingPayments.push(paymentEntry);
        paymentEntriesMap.set(purchaseEntryId, existingPayments);
    }

    const reports = purchaseEntries.map((purchaseEntry) => {
        const purchaseEntryId = (
            purchaseEntry._id as mongoose.Types.ObjectId
        ).toString();

        return {
            purchaseEntry,
            qualityCheck:
                qualityCheckMap.get(purchaseEntryId) ?? null,
            paymentEntries:
                paymentEntriesMap.get(purchaseEntryId) ?? [],
        };
    });

    return {
        reports,
        totalRecords,
    };
};
export const findAllDebitReports = async (
    page: number,
    limit: number,
) => {
    const skip = (page - 1) * limit;

    const [paymentResult, expenseResult] = await Promise.all([
        PaymentEntryModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                },
            },
            {
                $lookup: {
                    from: PurchaseEntryModel.collection.name,
                    localField: "purchaseInvoice",
                    foreignField: "_id",
                    as: "purchaseInvoice",
                },
            },
            {
                $unwind: {
                    path: "$purchaseInvoice",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: VendorModel.collection.name,
                    localField: "purchaseInvoice.vendor",
                    foreignField: "_id",
                    as: "vendor",
                },
            },
            {
                $unwind: {
                    path: "$vendor",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    __v: 0,
                    "purchaseInvoice.__v": 0,
                    "vendor.__v": 0,
                },
            },
        ]),
        DailyExpenseModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                },
            },
            {
                $project: {
                    __v: 0,
                },
            },
        ]),
    ]);

    const paymentRecords = paymentResult.map((payment) => ({
        ...payment,
        type: "PaymentEntry",
        reportDate: payment.createdAt,
    }));

    const expenseRecords = expenseResult.map((expense) => ({
        ...expense,
        type: "DailyExpense",
        reportDate: expense.date,
    }));

    const allRecords = [...paymentRecords, ...expenseRecords].sort(
        (a, b) =>
            new Date(b.reportDate).getTime() -
            new Date(a.reportDate).getTime(),
    );

    const totalRecords = allRecords.length;
    const data = allRecords.slice(skip, skip + limit);

    return {
        data,
        pagination: getPaginationMeta(page, limit, totalRecords),
    };
};
export const findAllDamageProductReports = async (
    page: number,
    limit: number,
) => {
    const [salesReturns, purchaseQualityChecks] = await Promise.all([
        SalesReturnModel.find({
            reason: "Damage",
            isDeleted: false,
        })
            .populate({
                path: "bill",
                populate: {
                    path: "customer",
                },
            })
            .sort({ createdAt: -1 })
            .lean(),

        PurchaseQualityCheckModel.find({
            isDeleted: false,
            "products.damageQty": { $gt: 0 },
        })
            .populate({
                path: "purchaseEntry",
                populate: {
                    path: "vendor",
                },
            })
            .populate("checkedBy")
            .sort({ createdAt: -1 })
            .lean(),
    ]);

    const salesReturnRecords = salesReturns.map((salesReturn: { bill: unknown; billingProductId: any; createdAt: any; }) => {
        const bill = salesReturn.bill as unknown as {
            products?: Array<{
                _id: unknown;
                productName: string;
                qty: number;
                sellingPrice: number;
                stock: unknown;
            }>;
        } | null;

        const returnedProduct = bill?.products?.find(
            (product) =>
                String(product._id) ===
                String(salesReturn.billingProductId),
        );

        return {
            type: "SalesReturn" as const,
            reportDate: salesReturn.createdAt,
            salesReturn,
            bill,
            returnedProduct: returnedProduct ?? null,
        };
    });

    const purchaseDamageRecords = purchaseQualityChecks.flatMap(
        (qualityCheck: { purchaseEntry: unknown; products: any[]; createdAt: any; _id: any; checkedBy: any; }) => {
            const purchaseEntry = qualityCheck.purchaseEntry as unknown as {
                _id: unknown;
                invoiceNo: string;
                purchaseDate: Date;
                vendor: unknown;
                products: Array<{
                    _id: unknown;
                    productName: string;
                    purchaseQty: number;
                    purchaseRate: number;
                }>;
            } | null;

            return qualityCheck.products
                .filter((product: { damageQty: number; }) => product.damageQty > 0)
                .map((product: any) => ({
                    type: "PurchaseDamage" as const,
                    reportDate: qualityCheck.createdAt,
                    purchaseEntry,
                    qualityCheck: {
                        _id: qualityCheck._id,
                        checkedBy: qualityCheck.checkedBy,
                        damageProduct: product,
                    },
                }));
        },
    );

    const allRecords = [
        ...salesReturnRecords,
        ...purchaseDamageRecords,
    ].sort(
        (a, b) =>
            new Date(b.reportDate ?? 0).getTime() -
            new Date(a.reportDate ?? 0).getTime(),
    );

    const totalRecords = allRecords.length;
    const skip = (page - 1) * limit;

    return {
        data: allRecords.slice(skip, skip + limit),
        totalRecords,
    };
}