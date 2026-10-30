import mongoose from "mongoose";
import * as purchaseQualityCheckRepo from "./purchaseQualityCheckRepository";
import { message } from "../../constants/responseMessage";
import { StockListParams } from "./purchaseQualityCheckRepository";
import { getPaginationMeta } from "../../utils/pagination";
import StockModel from "../../models/stockModel";
import StockBatchModel from "../../models/stockBatchModel";

interface QualityCheckProductInput {
    purchaseEntryProduct: string;
    damageQty: number;
}

interface QualityCheckInput {
    purchaseEntry: string;
    products: QualityCheckProductInput[];
}

interface PurchaseProduct {
    _id: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
    minimumStockAlertQuantity: number;
    purchaseQty: number;
    purchaseRate: number;
    qcStatus: "Pending" | "Done";

}

const getErrorMessage = (key: string, fallback: string) => {
    return (message as Record<string, string>)[key] ?? fallback;
};

const updateStockAfterQualityCheck = async (
    purchaseEntry: any,
    products: any[],
    purchaseProductsById: Map<string, PurchaseProduct>,
) => {
    const stockBatchDetails = [];

    for (const qcProduct of products) {
        const purchaseProduct = purchaseProductsById.get(
            qcProduct.purchaseEntryProduct.toString(),
        );

        if (!purchaseProduct) {
            throw new Error("Purchase product not found");
        }

        if (qcProduct.damageQty > 0) {
            const stock = await StockModel.findOneAndUpdate(
                {
                    product: purchaseProduct.product,
                    isDeleted: false,
                    availableStockQuantity: {
                        $gte: qcProduct.damageQty,
                    },
                },
                {
                    $inc: {
                        availableStockQuantity: -qcProduct.damageQty,
                    },
                },
                {
                    new: true,
                    runValidators: true,
                },
            );

            if (!stock) {
                throw new Error(
                    "Insufficient stock quantity to deduct damaged products",
                );
            }
        }

        if (qcProduct.approvedQty === 0) {
            continue;
        }

        const existingBatch = await StockBatchModel.findOne({
            purchaseEntryProduct: purchaseProduct._id,
            isDeleted: false,
        });

        if (existingBatch) {
            throw new Error(
                "Stock batch already exists for this purchase product",
            );
        }

        const stockBatch = await StockBatchModel.create({
            product: purchaseProduct.product,
            vendor: purchaseEntry.vendor,
            purchaseEntry: purchaseEntry._id,
            purchaseEntryProduct: purchaseProduct._id,
            ...(purchaseEntry.store && {
                store: purchaseEntry.store,
            }),
            purchaseRate: purchaseProduct.purchaseRate,
            purchaseQty: purchaseProduct.purchaseQty,
            approvedQty: qcProduct.approvedQty,
            remainingQty: qcProduct.approvedQty,
            purchaseDate: purchaseEntry.purchaseDate,
        });

        stockBatchDetails.push(stockBatch);
    }

    return stockBatchDetails;
};


export const createOrUpdateQualityCheckService = async (
    data: QualityCheckInput,
    checkedBy: string,
) => {
    try {
        console.log("1. Starting purchase quality check");
        console.log("2. Request data:", JSON.stringify(data, null, 2));
        console.log("3. Checked by:", checkedBy);

        if (!mongoose.Types.ObjectId.isValid(data.purchaseEntry)) {
            console.log("ERROR: Invalid purchase entry ID:", data.purchaseEntry);

            throw new Error(
                getErrorMessage(
                    "INVALID_PURCHASE_ENTRY_ID",
                    "Invalid purchase entry ID",
                ),
            );
        }

        console.log("4. Purchase entry ID validated");

        if (!mongoose.Types.ObjectId.isValid(checkedBy)) {
            console.log("ERROR: Invalid user ID:", checkedBy);
            throw new Error("Invalid user ID");
        }

        console.log("5. User ID validated");

        if (!Array.isArray(data.products) || data.products.length === 0) {
            console.log("ERROR: No products submitted");
            throw new Error("At least one product is required");
        }

        console.log("6. Product array validated");
        console.log("7. Searching purchase entry:", data.purchaseEntry);

        const purchaseEntry =
            await purchaseQualityCheckRepo.findPurchaseEntryById(
                data.purchaseEntry,
            );

        console.log("8. Purchase entry lookup result:", purchaseEntry);

        if (!purchaseEntry) {
            console.log("ERROR: Purchase entry not found");

            throw new Error(
                getErrorMessage(
                    "PURCHASE_ENTRY_NOT_FOUND",
                    "Purchase entry not found",
                ),
            );
        }

        console.log("9. Purchase entry found:", purchaseEntry._id);

        const purchaseProducts =
            purchaseEntry.products as unknown as PurchaseProduct[];

        console.log("10. Purchase entry products:", purchaseProducts);

        const purchaseProductsById = new Map(
            purchaseProducts.map((product) => [
                product._id.toString(),
                product,
            ]),
        );

        console.log(
            "11. Purchase product IDs:",
            Array.from(purchaseProductsById.keys()),
        );

        const submittedProductIds = new Set<string>();

        const products = data.products.map((inputProduct, index) => {
            console.log(`12.${index + 1}. Processing submitted product`);
            console.log("Submitted product:", inputProduct);

            if (
                !mongoose.Types.ObjectId.isValid(
                    inputProduct.purchaseEntryProduct,
                )
            ) {
                console.log("ERROR: Invalid purchase product ID");

                throw new Error("Invalid purchase product ID");
            }

            const productId = inputProduct.purchaseEntryProduct;

            if (submittedProductIds.has(productId)) {
                console.log("ERROR: Duplicate purchase product:", productId);

                throw new Error("Duplicate purchase product ID");
            }

            submittedProductIds.add(productId);

            const purchaseProduct = purchaseProductsById.get(productId);

            console.log("Matched purchase product:", purchaseProduct);

            if (!purchaseProduct) {
                console.log(
                    "ERROR: Product does not belong to purchase entry:",
                    productId,
                );

                throw new Error(
                    "Product does not belong to the selected purchase entry",
                );
            }

            if (purchaseProduct.qcStatus === "Done") {
                console.log("ERROR: QC already completed:", productId);

                throw new Error(
                    "Quality check has already been completed for this product",
                );
            }

            const damageQty = inputProduct.damageQty;

            console.log("Purchase quantity:", purchaseProduct.purchaseQty);
            console.log("Damage quantity:", damageQty);

            if (
                typeof damageQty !== "number" ||
                !Number.isInteger(damageQty) ||
                damageQty < 0 ||
                damageQty > purchaseProduct.purchaseQty
            ) {
                console.log("ERROR: Invalid damage quantity");

                throw new Error("Invalid damage quantity");
            }

            const approvedQty =
                purchaseProduct.purchaseQty - damageQty;

            const payableAfterQC = Number(
                (approvedQty * purchaseProduct.purchaseRate).toFixed(2),
            );

            console.log("Approved quantity:", approvedQty);
            console.log("Payable after QC:", payableAfterQC);

            return {
                purchaseEntryProduct: purchaseProduct._id,
                product: purchaseProduct.product,
                totalQty: purchaseProduct.purchaseQty,
                purchaseRate: purchaseProduct.purchaseRate,
                damageQty,
                approvedQty,
                availableQtyAfterQC: approvedQty,
                payableAfterQC,
            };
        });

        console.log("13. All submitted products validated:", products);

        console.log("14. Searching existing quality check");

        const existingQC =
            await purchaseQualityCheckRepo.findQualityCheckByPurchaseEntry(
                purchaseEntry._id,
            );

        console.log("15. Existing quality check:", existingQC);

        const existingProducts = existingQC?.products ?? [];

        const existingQCProductIds = new Set(
            existingProducts.map(
                (product: { purchaseEntryProduct: { toString: () => any } }) =>
                    product.purchaseEntryProduct.toString(),
            ),
        );

        console.log(
            "16. Existing QC product IDs:",
            Array.from(existingQCProductIds),
        );

        for (const product of products) {
            if (
                existingQCProductIds.has(
                    product.purchaseEntryProduct.toString(),
                )
            ) {
                console.log(
                    "ERROR: QC already exists for product:",
                    product.purchaseEntryProduct,
                );

                throw new Error(
                    "Quality check already exists for this product",
                );
            }
        }

        console.log("17. Existing QC duplicate check completed");

        const allQCProducts = [
            ...existingProducts,
            ...products,
        ];

        console.log("18. Combined QC products:", allQCProducts);

        const totalApprovedQty = allQCProducts.reduce(
            (total, product) => total + product.approvedQty,
            0,
        );

        const totalDamagedQty = allQCProducts.reduce(
            (total, product) => total + product.damageQty,
            0,
        );

        const availableQtyAfterQC = allQCProducts.reduce(
            (total, product) => total + product.availableQtyAfterQC,
            0,
        );

        const payableAfterQC = Number(
            allQCProducts
                .reduce(
                    (total, product) => total + product.payableAfterQC,
                    0,
                )
                .toFixed(2),
        );

        console.log("19. QC totals calculated:", {
            totalApprovedQty,
            totalDamagedQty,
            availableQtyAfterQC,
            payableAfterQC,
        });

        const qualityCheckData = {
            purchaseEntry: purchaseEntry._id,
            products: allQCProducts,
            totalApprovedQty,
            totalDamagedQty,
            availableQtyAfterQC,
            payableAfterQC,
            checkedBy: new mongoose.Types.ObjectId(checkedBy),
        };

        console.log("20. Quality check data prepared:", qualityCheckData);

        let qualityCheck;

        if (existingQC) {
            console.log("21. Updating existing quality check");

            qualityCheck =
                await purchaseQualityCheckRepo.updateQualityCheck(
                    purchaseEntry._id,
                    qualityCheckData,
                );

            console.log("22. Quality check update result:", qualityCheck);
        } else {
            console.log("21. Creating new quality check");

            qualityCheck =
                await purchaseQualityCheckRepo.createQualityCheck(
                    qualityCheckData,
                );

            console.log("22. Quality check creation result:", qualityCheck);
        }

        if (!qualityCheck) {
            console.log("ERROR: Failed to save quality check");
            throw new Error("Failed to save quality check");
        }

        console.log("23. Updating stock and creating stock batches");

        const stockBatchDetails = await updateStockAfterQualityCheck(
            purchaseEntry,
            products,
            purchaseProductsById,
        );

        console.log("24. Stock batch update result:", stockBatchDetails);

        console.log("25. Updating purchase entry product QC statuses");

        const qcStatusResult =
            await purchaseQualityCheckRepo.updatePurchaseEntryProductQCStatus(
                data.purchaseEntry,
                products.map(
                    (product) =>
                        product.purchaseEntryProduct as mongoose.Types.ObjectId,
                ),
            );

        console.log("26. QC status update result:", qcStatusResult);

        console.log("27. Purchase quality check completed successfully");

        return {
            qualityCheck,
            stockBatchDetails,
        };
    } catch (error) {
        console.error("Purchase quality check service failed:", error);
        throw error;
    }
};

const formatQualityCheck = (qualityCheck: any) => {
    console.log("1. Formatting quality check response");
    console.log("2. Quality check input:", qualityCheck);

    const purchaseEntry = qualityCheck.purchaseEntry;

    console.log("3. Purchase entry:", purchaseEntry);

    const approvedProducts = qualityCheck.products
        .filter((product: any) => product.approvedQty > 0)
        .map((product: any) => ({
            purchaseEntryProduct: product.purchaseEntryProduct,
            product: product.product,
            productName:
                product.product?.name ?? product.product?.toString(),
            qty: product.approvedQty,
            rate: product.purchaseRate,
            amount: product.payableAfterQC,
        }));

    console.log("4. Approved products:", approvedProducts);

    const damagedProducts = qualityCheck.products
        .filter((product: any) => product.damageQty > 0)
        .map((product: any) => ({
            purchaseEntryProduct: product.purchaseEntryProduct,
            product: product.product,
            productName:
                product.product?.name ?? product.product?.toString(),
            qty: product.damageQty,
            rate: product.purchaseRate,
            amount: Number(
                (product.damageQty * product.purchaseRate).toFixed(2),
            ),
        }));

    console.log("5. Damaged products:", damagedProducts);

    const formattedResponse = {
        _id: qualityCheck._id,
        purchaseEntry: {
            _id: purchaseEntry?._id,
            invoiceNo: purchaseEntry?.invoiceNo,
            purchaseDate: purchaseEntry?.purchaseDate,
            vendor: purchaseEntry?.vendor,
        },
        summary: {
            totalApprovedQty: qualityCheck.totalApprovedQty,
            availableQtyAfterQC: qualityCheck.availableQtyAfterQC,
            damagedQty: qualityCheck.totalDamagedQty,
            payableAfterQC: qualityCheck.payableAfterQC,
        },
        approvedProducts,
        damagedProducts,
    };

    console.log("6. Final formatted quality check:", formattedResponse);

    return formattedResponse;
};


export const getQualityCheckByIdService = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(
            getErrorMessage(
                "INVALID_QUALITY_CHECK_ID",
                "Invalid quality check ID",
            ),
        );
    }

    const qualityCheck =
        await purchaseQualityCheckRepo.findQualityCheckById(id);

    if (!qualityCheck) {
        throw new Error(
            getErrorMessage(
                "PURCHASE_QUALITY_CHECK_NOT_FOUND",
                "Purchase quality check not found",
            ),
        );
    }

    return formatQualityCheck(qualityCheck);
};

export const getQualityCheckByPurchaseEntryService = async (
    purchaseEntryId: string,
) => {
    if (!mongoose.Types.ObjectId.isValid(purchaseEntryId)) {
        throw new Error(
            getErrorMessage(
                "INVALID_PURCHASE_ENTRY_ID",
                "Invalid purchase entry ID",
            ),
        );
    }

    const qualityCheck =
        await purchaseQualityCheckRepo.findQualityCheckByPurchaseEntry(
            new mongoose.Types.ObjectId(purchaseEntryId),
        );

    if (!qualityCheck) {
        throw new Error(
            getErrorMessage(
                "PURCHASE_QUALITY_CHECK_NOT_FOUND",
                "Purchase quality check not found",
            ),
        );
    }

    const populatedQualityCheck =
        await purchaseQualityCheckRepo.findQualityCheckById(
            qualityCheck._id.toString(),
        );

    if (!populatedQualityCheck) {
        throw new Error(
            getErrorMessage(
                "PURCHASE_QUALITY_CHECK_NOT_FOUND",
                "Purchase quality check not found",
            ),
        );
    }

    return formatQualityCheck(populatedQualityCheck);
};

export const getAllQualityChecksService = async () => {
    const qualityChecks =
        await purchaseQualityCheckRepo.findAllQualityChecks();

    return qualityChecks.map(formatQualityCheck);
};

export const getAllStockService = async (
    params: StockListParams,
) => {
    const result = await purchaseQualityCheckRepo.findAllStock(params);

    return {
        data: result.data,
        pagination: getPaginationMeta(
            params.page,
            params.limit,
            result.totalRecords,
        ),
    };
};
