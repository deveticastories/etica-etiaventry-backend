import mongoose from "mongoose";
import SalesReturnModel, {
    type SalesReturnDocument,
} from "../../models/salesReturnModel"; import StockModel from "../../models/stockModel";
import BillingModel from "../../models/billingModel";

export interface SalesReturnListParams {
    page: number;
    limit: number;
    search?: string;
}

export const createSalesReturn = async (
    data: Record<string, unknown>,
) => {
    return SalesReturnModel.create(data);
};

export const findAllSalesReturns = async ({
    page,
    limit,
    search,
}: SalesReturnListParams) => {
    const filter = {
        isDeleted: false,
    } as Record<string, unknown>;

    if (search?.trim()) {
        const searchValue = search.trim();

        if (mongoose.isValidObjectId(searchValue)) {
            filter.$or = [
                { bill: new mongoose.Types.ObjectId(searchValue) },
                { _id: new mongoose.Types.ObjectId(searchValue) },
            ];
        } else {
            filter.returnType = {
                $regex: searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                $options: "i",
            };
        }
    }

    const [data, totalRecords] = await Promise.all([
        SalesReturnModel.find(filter)
            .populate("bill")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        SalesReturnModel.countDocuments(filter),
    ]);

    return {
        data,
        totalRecords,
    };
};

export const findSalesReturnById = async (id: string) => {
    return SalesReturnModel.findOne({
        _id: id,
        isDeleted: false,
    }).populate("bill");
};

export const updateSalesReturn = async (
    id: string,
    data: Record<string, unknown>,
) => {
    return SalesReturnModel.findOneAndUpdate(
        {
            _id: id,
            isDeleted: false,
        },
        {
            $set: data,
        },
        {
            new: true,
            runValidators: true,
        },
    ).populate("bill");
};

export const softDeleteSalesReturn = async (id: string) => {
    return SalesReturnModel.findOneAndUpdate(
        {
            _id: id,
            isDeleted: false,
        },
        {
            $set: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        },
        {
            new: true,
        },
    );
};


export const approveSalesReturnAndRestoreStock = async (
    salesReturnId: string,
): Promise<SalesReturnDocument | null> => {
    const session = await mongoose.startSession();

    try {
        let updatedSalesReturn: SalesReturnDocument | null = null;

        await session.withTransaction(async () => {
            const salesReturn = await SalesReturnModel.findOne({
                _id: salesReturnId,
                isDeleted: false,
                isApproved: false,
            }).session(session);

            if (!salesReturn) return;

            const billing = await BillingModel.findOne({
                _id: salesReturn.bill,
                isDeleted: false,
            }).session(session);

            if (!billing) return;

            const billingProduct = billing.products.find(
                (product: { _id: { toString: () => string; }; }) =>
                    product._id.toString() ===
                    salesReturn.billingProductId.toString(),
            );

            if (!billingProduct) return;

            const stockUpdate = await StockModel.updateOne(
                {
                    _id: billingProduct.stock,
                    isDeleted: false,
                },
                {
                    $inc: {
                        availableStockQuantity: salesReturn.returnQuantity,
                    },
                },
                { session },
            );

            if (stockUpdate.matchedCount !== 1) return;

            const invoiceValue = billing.invoiceTotal;
            const updatedInvoiceValue = Math.max(
                0,
                invoiceValue -
                    salesReturn.returnQuantity * billingProduct.sellingPrice,
            );

            const result = await SalesReturnModel.findOneAndUpdate(
                {
                    _id: salesReturnId,
                    isDeleted: false,
                    isApproved: false,
                },
                {
                    $set: {
                        invoiceValue,
                        updatedInvoiceValue,
                        isApproved: true,
                    },
                },
                {
                    new: true,
                    runValidators: true,
                    session,
                },
            );

            if (result) {
                updatedSalesReturn = result;
            }
        });

        return updatedSalesReturn;
    } finally {
        await session.endSession();
    }
};