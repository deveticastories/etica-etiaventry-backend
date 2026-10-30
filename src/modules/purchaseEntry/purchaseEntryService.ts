import mongoose from "mongoose";
import VendorModel from "../../models/vendorModel";
import ProductModel from "../../models/productModel";
import StockModel from "../../models/stockModel";
import StoreModel from "../../models/storeModel";
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
        product: new mongoose.Types.ObjectId(product.product),
        minimumStockAlertQuantity: product.minimumStockAlertQuantity,
        purchaseQty: product.purchaseQty,
        purchaseRate: product.purchaseRate,
        amount: Number(
            (product.purchaseQty * product.purchaseRate).toFixed(2),
        ),
    }));

    return {
        products: calculatedProducts,
        totalProductQty: calculatedProducts.reduce(
            (total, product) => total + product.purchaseQty,
            0,
        ),
        totalAmount: Number(
            calculatedProducts
                .reduce((total, product) => total + product.amount, 0)
                .toFixed(2),
        ),
    };
};
const generateInvoiceNo = async (): Promise<string> => {
    const count = await countPurchaseEntries();

    let nextNumber = count + 1;
    let invoiceNo = `PUR-${String(nextNumber).padStart(4, "0")}`;

    while (await purchaseInvoiceExists(invoiceNo)) {
        nextNumber++;
        invoiceNo = `PUR-${String(nextNumber).padStart(4, "0")}`;
    }

    return invoiceNo;
};

const validateProducts = async (
    products: CreatePurchaseEntryInput["products"],
) => {
    if (
        !products?.length ||
        products.some(
            (product) =>
                !mongoose.isValidObjectId(product.product) ||
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

    const productIds = [
        ...new Set(products.map((product) => product.product.toString())),
    ];

    const existingProducts = await ProductModel.find({
        _id: { $in: productIds },
        isDeleted: false,
    }).select("_id");

    const existingProductIds = new Set(
        existingProducts.map((product) => product._id.toString()),
    );

    const invalidProduct = productIds.find(
        (productId) => !existingProductIds.has(productId),
    );

    if (invalidProduct) {
        throw {
            statusCode: 404,
            message: message.PRODUCT_NOT_FOUND,
        };
    }
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


        if (input.store) {
            const storeExists = await StoreModel.exists({
                _id: input.store,
                isDeleted: false,
            });

            if (!storeExists) {
                throw {
                    statusCode: 404,
                    message: message.PURCHASE_STORE_NOT_FOUND,
                };
            }
        }


        await validateProducts(input.products);


        const invoiceNo = await generateInvoiceNo();


        const totals = calculateTotals(input.products);


        const purchaseEntry = await createPurchaseEntry({
            invoiceNo,
            purchaseDate: input.purchaseDate,
            vendor: new mongoose.Types.ObjectId(input.vendor),
            ...(input.store && {
                store: new mongoose.Types.ObjectId(input.store),
            }),
            products: totals.products,
            totalProductQty: totals.totalProductQty,
            totalAmount: totals.totalAmount,
            totalIncludingGST: input.totalIncludingGST,
            createdBy,
        });


        if (!purchaseEntry) {
            throw new Error("Failed to create purchase entry");
        }

        const stockDetails = [];

        for (const [index, product] of totals.products.entries()) {

            const stock = await StockModel.findOneAndUpdate(
                {
                    product: product.product,
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
                        product: product.product,
                        createdBy,
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

    if (input.store !== undefined) {
        if (input.store) {
            const storeExists = await StoreModel.exists({
                _id: input.store,
                isDeleted: false,
            });

            if (!storeExists) {
                throw new Error("PURCHASE_STORE_NOT_FOUND");
            }

            updateData.store = new mongoose.Types.ObjectId(input.store);
        } else {
            updateData.store = undefined;
        }
    }

    if (input.products !== undefined) {
        await validateProducts(input.products);

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
