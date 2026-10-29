import mongoose from "mongoose";
import VendorModel from "../../models/vendorModel";
import StockModel from "../../models/stockModel"
import {
    createPurchaseEntry,
    findPurchaseEntryById,
    getAllPurchaseEntries,
    updatePurchaseEntryById,
    deletePurchaseEntryById,
    countPurchaseEntries,
    purchaseInvoiceExists,
} from "./purchaseEntryRepository";
import {
    CreatePurchaseEntryInput,
    UpdatePurchaseEntryInput,
} from "../../validation/purchaseEntryValidation";
import { message } from "../../constants/responseMessage";

const calculateTotals = (
    products: CreatePurchaseEntryInput["products"],
) => {
    const calculatedProducts = products.map((product) => ({
        productName: product.productName.trim(),
        minimumStockAlertQuantity: product.minimumStockAlertQuantity,
        purchaseQty: product.purchaseQty,
        purchaseRate: product.purchaseRate,
        amount: product.purchaseQty * product.purchaseRate,
    }));

    return {
        products: calculatedProducts,
        totalProductQty: calculatedProducts.reduce(
            (total, product) => total + product.purchaseQty,
            0,
        ),
        totalAmount: calculatedProducts.reduce(
            (total, product) => total + product.amount,
            0,
        ),
    };
};

const generateInvoiceNo = async (): Promise<string> => {
    const count = await countPurchaseEntries();
    let invoiceNo = `PUR-${String(count + 1).padStart(4, "0")}`;

    while (await purchaseInvoiceExists(invoiceNo)) {
        const nextCount = await countPurchaseEntries();
        invoiceNo = `PUR-${String(nextCount + 1).padStart(4, "0")}`;
    }

    return invoiceNo;
};
export const createPurchaseEntryService = async (
    input: CreatePurchaseEntryInput,
    createdBy: mongoose.Types.ObjectId,
) => {
    try {
        const vendorExists = await VendorModel.exists({
            _id: input.vendor,
            isDeleted: false,
        });

        if (!vendorExists) {
            throw {
                statusCode: 404,
                message: message.PURCHASE_VENDOR_NOT_FOUND,
            };
        }

        if (
            !input.products?.length ||
            input.products.some(
                (product) =>
                    !product.productName?.trim() ||
                    !Number.isInteger(product.purchaseQty) ||
                    product.purchaseQty <= 0 ||
                    !Number.isFinite(product.purchaseRate) ||
                    product.purchaseRate < 0 ||
                    !Number.isInteger(product.minimumStockAlertQuantity) ||
                    product.minimumStockAlertQuantity < 0,
            )
        ) {
            throw {
                statusCode: 400,
                message: message.INVALID_PURCHASE_PRODUCTS,
            };
        }

        const invoiceNo = await generateInvoiceNo();

        const products = input.products.map((product) => ({
            productName: product.productName.trim(),
            minimumStockAlertQuantity: product.minimumStockAlertQuantity,
            purchaseQty: product.purchaseQty,
            purchaseRate: product.purchaseRate,
            amount: Number(
                (product.purchaseQty * product.purchaseRate).toFixed(2),
            ),
        }));

        const totalProductQty = products.reduce(
            (total, product) => total + product.purchaseQty,
            0,
        );

        const totalAmount = Number(
            products
                .reduce((total, product) => total + product.amount, 0)
                .toFixed(2),
        );

        const purchaseEntry = await createPurchaseEntry({
            invoiceNo,
            purchaseDate: input.purchaseDate,
            vendor: new mongoose.Types.ObjectId(input.vendor),
            products,
            totalProductQty,
            totalAmount,
            totalIncludingGST: input.totalIncludingGST,
            qcStatus: "Pending",
            createdBy,
        });

        const stockDetails = [];

        for (const product of purchaseEntry.products) {
            const stock = await StockModel.findOneAndUpdate(
                {
                    productName: product.productName.trim(),
                    isDeleted: false,
                },
                {
                    $inc: {
                        availableStockQuantity: product.purchaseQty,
                    },
                    $set: {
                        minimumStockAlertQuantity:
                            product.minimumStockAlertQuantity,
                    },
                    $setOnInsert: {
                        productName: product.productName.trim(),
                        createdBy,
                    },
                    $addToSet: {
                        purchaseEntryProduct: product._id,
                    },
                },
                {
                    upsert: true,
                    returnDocument: "after",
                    runValidators: true,
                    setDefaultsOnInsert: true,
                },
            );

            if (stock) {
                stockDetails.push(stock);
            }
        }

        return {
            purchaseEntry,
            stockDetails,
        };
    } catch (error) {
        console.error("Create purchase entry failed:", error);
        throw error;
    }
};

export const getAllPurchaseEntriesService = async (
    page: number,
    limit: number,
) => {
    return getAllPurchaseEntries(page, limit);
};

export const getPurchaseEntryByIdService = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new Error("PURCHASE_ID_INVALID");
    }

    const purchaseEntry = await findPurchaseEntryById(id);

    if (!purchaseEntry) {
        throw new Error("PURCHASE_NOT_FOUND");
    }

    return purchaseEntry;
};

export const updatePurchaseEntryService = async (
    id: string,
    input: UpdatePurchaseEntryInput,
    updatedBy: mongoose.Types.ObjectId,
) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new Error("PURCHASE_ID_INVALID");
    }

    const existingEntry = await findPurchaseEntryById(id);

    if (!existingEntry) {
        throw new Error("PURCHASE_NOT_FOUND");
    }

    const updateData: Record<string, unknown> = {
        updatedBy,
        userUpdatedDate: new Date(),
    };

    if (input.purchaseDate !== undefined) {
        updateData.purchaseDate = input.purchaseDate;
    }

    if (input.vendor !== undefined) {
        const vendorExists = await VendorModel.exists({
            _id: input.vendor,
            isDeleted: false,
        });

        if (!vendorExists) {
            throw new Error("PURCHASE_VENDOR_NOT_FOUND");
        }

        updateData.vendor = new mongoose.Types.ObjectId(input.vendor);
    }

    if (input.products !== undefined) {
        const totals = calculateTotals(input.products);
        Object.assign(updateData, totals);
    }

    if (input.totalIncludingGST !== undefined) {
        updateData.totalIncludingGST = input.totalIncludingGST;
    }

    if (input.qcStatus !== undefined) {
        updateData.qcStatus = input.qcStatus;
    }

    const updatedEntry = await updatePurchaseEntryById(id, updateData);

    if (!updatedEntry) {
        throw new Error("PURCHASE_NOT_FOUND");
    }

    return updatedEntry;
};

export const updatePurchaseEntryQCService = async (
    id: string,
    qcStatus: "Pending" | "Done",
) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new Error("PURCHASE_ID_INVALID");
    }

    const existingEntry = await findPurchaseEntryById(id);

    if (!existingEntry) {
        throw new Error("PURCHASE_NOT_FOUND");
    }

    const updatedEntry = await updatePurchaseEntryById(id, {
        qcStatus,
    });

    if (!updatedEntry) {
        throw new Error("PURCHASE_NOT_FOUND");
    }

    return updatedEntry;
};

export const deletePurchaseEntryService = async (
    id: string,
    deletedBy: mongoose.Types.ObjectId,
) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new Error("PURCHASE_ID_INVALID");
    }

    const existingEntry = await findPurchaseEntryById(id);

    if (!existingEntry) {
        throw new Error("PURCHASE_NOT_FOUND");
    }

    const deletedEntry = await deletePurchaseEntryById(id, deletedBy);

    if (!deletedEntry) {
        throw new Error("PURCHASE_NOT_FOUND");
    }

    return deletedEntry;
};
