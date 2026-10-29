import mongoose from "mongoose";
import BillingModel, { type Billing } from "../../models/billingModel";
import StockModel from "../../models/stockModel";

export const createBilling = async (
    data: Partial<Billing>,
    session: mongoose.ClientSession,
) => {
    const [billing] = await BillingModel.create([data], { session });
    return billing;
};

export const findBillingById = async (id: string) => {
    return BillingModel.findOne({
        _id: id,
        isDeleted: false,
    })
        .populate("customer", "staffName email mobileNumber")
        .lean();
};

export const findAllBillings = async (
    page: number,
    limit: number,
    search?: string,
) => {
    const filter: Record<string, unknown> = {
        isDeleted: false,
    };

    if (search?.trim()) {
        filter.$or = [
            { invoiceNo: { $regex: search.trim(), $options: "i" } },
        ];
    }

    const [data, totalRecords] = await Promise.all([
        BillingModel.find(filter)
            .populate("customer", "staffName email mobileNumber")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        BillingModel.countDocuments(filter),
    ]);

    return { data, totalRecords };
};

export const findLastBilling = async (
    session: mongoose.ClientSession,
) => {
    return BillingModel.findOne({
        invoiceNo: { $regex: /^INV-\d+$/ },
    })
        .sort({ createdAt: -1 })
        .session(session)
        .lean();
};

export const decreaseStock = async (
    stockId: mongoose.Types.ObjectId,
    qty: number,
    session: mongoose.ClientSession,
) => {
    return StockModel.findOneAndUpdate(
        {
            _id: stockId,
            isDeleted: false,
            availableStockQuantity: { $gte: qty },
        },
        {
            $inc: { availableStockQuantity: -qty },
        },
        {
            session,
            returnDocument: "after",
            runValidators: true,
        },
    );
};
export const updateBillingPaymentStatus = async (
    id: string,
    isPaymentReceived: boolean,
) => {
    return BillingModel.findOneAndUpdate(
        {
            _id: id,
            isDeleted: false,
        },
        {
            $set: {
                isPaymentReceived,
            },
        },
        {
            new: true,
            runValidators: true,
        },
    )
        .populate("customer", "staffName email mobileNumber")
        .lean();
};