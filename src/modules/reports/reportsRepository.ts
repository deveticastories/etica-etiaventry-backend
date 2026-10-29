import mongoose from "mongoose";
import PurchaseEntryModel from "../../models/purchaseEntryModel";
import PurchaseQualityCheckModel from "../../models/purchaseQualityCheckModel";
import PaymentEntryModel from "../../models/paymentEntryModel";

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