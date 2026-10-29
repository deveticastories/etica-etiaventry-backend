import mongoose from "mongoose";
import type { Billing } from "../../models/billingModel";
import BillingModel from "../../models/billingModel";
import {
    createBilling as createBillingRepo,
    decreaseStock,
    findAllBillings as findAllBillingsRepo,
    findBillingById,updateBillingPaymentStatus
} from "./billingRepository";
import { getPaginationMeta } from "../../utils/pagination";
import { message } from "../../constants/responseMessage";

interface CreateBillingProduct {
    stock: string;
    qty: number;
    sellingPrice: number;
}

interface CreateBillingInput {
    date?: Date;
    customer: string;
    defaultMargin?: number;
    products: CreateBillingProduct[];
}

const generateInvoiceNo = async (
    session: mongoose.ClientSession,
) => {
    const lastBilling = await BillingModel.findOne({
        invoiceNo: { $regex: /^INV-\d+$/ },
    })
        .sort({ invoiceNo: -1 })
        .session(session)
        .lean();

    const lastNumber = lastBilling
        ? Number(lastBilling.invoiceNo.replace("INV-", ""))
        : 0;

    return `INV-${String(lastNumber + 1).padStart(4, "0")}`;
};

export const createBillingService = async (
    input: CreateBillingInput,
    userId: mongoose.Types.ObjectId,
) => {
    if (!mongoose.isValidObjectId(input.customer)) {
        throw {
            statusCode: 400,
            message: message.BILLING_INVALID_CUSTOMER,
        };
    }

    if (!Array.isArray(input.products) || input.products.length === 0) {
        throw {
            statusCode: 400,
            message: message.BILLING_PRODUCTS_REQUIRED,
        };
    }

    const session = await mongoose.startSession();

    try {
        let createdBilling;

        await session.withTransaction(async () => {
            const products: Billing["products"] = [] as unknown as Billing["products"];

            let totalQty = 0;
            let invoiceTotal = 0;

            for (const item of input.products) {
                if (
                    !mongoose.isValidObjectId(item.stock) ||
                    !Number.isInteger(item.qty) ||
                    item.qty < 1 ||
                    !Number.isFinite(item.sellingPrice) ||
                    item.sellingPrice < 0
                ) {
                    throw {
                        statusCode: 400,
                        message: message.BILLING_INVALID_PRODUCT,
                    };
                }

                const stock = await decreaseStock(
                    new mongoose.Types.ObjectId(item.stock),
                    item.qty,
                    session,
                );

                if (!stock) {
                    throw {
                        statusCode: 400,
                        message: message.BILLING_INSUFFICIENT_STOCK,
                    };
                }

                const amount = item.qty * item.sellingPrice;

                products.push({
                    stock: stock._id,
                    productName: stock.productName,
                    availableQty: stock.availableStockQuantity,
                    qty: item.qty,
                    sellingPrice: item.sellingPrice,
                } as never);

                totalQty += item.qty;
                invoiceTotal += amount;
            }

            const invoiceNo = await generateInvoiceNo(session);

            const billingData: Partial<Billing> = {
                invoiceNo,
                date: input.date ?? new Date(),
                customer: new mongoose.Types.ObjectId(input.customer),
                defaultMargin: input.defaultMargin ?? 25,
                products,
                totalQty,
                invoiceTotal,
                createdBy: new mongoose.Types.ObjectId(userId),
            };

            createdBilling = await createBillingRepo(
                billingData,
                session,
            );
        });

        return createdBilling;
    } finally {
        await session.endSession();
    }
};

export const getAllBillingsService = async (
    page: number,
    limit: number,
    search?: string,
) => {
    const { data, totalRecords } = await findAllBillingsRepo(
        page,
        limit,
        search,
    );

    return {
        success: true,
        data,
        pagination: getPaginationMeta(page, limit, totalRecords),
    };
};

export const getBillingByIdService = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw {
            statusCode: 400,
            message: message.BILLING_INVALID_ID,
        };
    }

    const billing = await findBillingById(id);

    if (!billing) {
        throw {
            statusCode: 404,
            message: message.BILLING_NOT_FOUND,
        };
    }

    return billing;
};
export const updateBillingPaymentStatusService = async (
    id: string,
    isPaymentReceived: boolean,
) => {
    if (!mongoose.isValidObjectId(id)) {
        throw {
            statusCode: 400,
            message: message.INVALID_ID,
        };
    }

    const billing = await updateBillingPaymentStatus(
        id,
        isPaymentReceived,
    );

    if (!billing) {
        throw {
            statusCode: 404,
            message: message.BILLING_NOT_FOUND,
        };
    }

    return billing;

};