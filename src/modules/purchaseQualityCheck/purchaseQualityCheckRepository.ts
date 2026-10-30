import mongoose from "mongoose";
import PurchaseQualityCheckModel from "../../models/purchaseQualityCheckModel";
import PurchaseEntryModel from "../../models/purchaseEntryModel";
import VendorModel from "../../models/vendorModel";
import UserModel from "../../models/userModel";
import StockModel from "../../models/stockModel"
export const findPurchaseEntryById = async (id: string) => {


    const purchaseEntry = await PurchaseEntryModel.findById(id).lean();

    console.log("Repository: Raw purchase entry:", purchaseEntry);

    if (!purchaseEntry || purchaseEntry.isDeleted === true) {
        console.log("Repository: Purchase entry not found or deleted");
        return null;
    }

    return purchaseEntry;
};
export const findQualityCheckByPurchaseEntry = (
    purchaseEntry: mongoose.Types.ObjectId,
) => {
    return PurchaseQualityCheckModel.findOne({
        purchaseEntry,
        isDeleted: false,
    }).lean();
};

export const findQualityCheckById = (id: string) => {
    return PurchaseQualityCheckModel.findOne({
        _id: id,
        isDeleted: false,
    })
        .populate({
            path: "purchaseEntry",
            populate: {
                path: "vendor",
                model: VendorModel,
            },
        })
        .populate({
            path: "checkedBy",
            model: UserModel,
            select: "firstName lastName email",
        })
        .lean();
};

export const createQualityCheck = (
    data: Record<string, unknown>,
) => {
    return PurchaseQualityCheckModel.create(data);
};

export const updateQualityCheck = (
    purchaseEntry: mongoose.Types.ObjectId,
    data: Record<string, unknown>,
) => {
    return PurchaseQualityCheckModel.findOneAndUpdate(
        {
            purchaseEntry,
            isDeleted: false,
        },
        {
            $set: data,
        },
        {
            new: true,
            runValidators: true,
        },
    );
};


export const updatePurchaseEntryProductQCStatus = async (
    purchaseEntryId: string,
    productIds: mongoose.Types.ObjectId[],
) => {
    console.log("========== QC STATUS UPDATE ==========");
    console.log("Purchase Entry ID:", purchaseEntryId);
    console.log(
        "Product IDs:",
        productIds.map((id) => id.toString()),
    );

    const purchaseEntryBefore = await PurchaseEntryModel.findById(
        purchaseEntryId,
    ).lean();

    console.log(
        "Purchase entry before update:",
        purchaseEntryBefore?.products?.map((product: any) => ({
            _id: product._id.toString(),
            qcStatus: product.qcStatus,
        })),
    );

    const result = await PurchaseEntryModel.updateOne(
        {
            _id: purchaseEntryId,
        },
        {
            $set: {
                "products.$[product].qcStatus": "Done",
            },
        },
        {
            arrayFilters: [
                {
                    "product._id": {
                        $in: productIds,
                    },
                },
            ],
            runValidators: true,
        },
    );

    console.log("MongoDB update result:", result);

    const purchaseEntryAfter = await PurchaseEntryModel.findById(
        purchaseEntryId,
    ).lean();

    console.log(
        "Purchase entry after update:",
        purchaseEntryAfter?.products?.map((product: any) => ({
            _id: product._id.toString(),
            qcStatus: product.qcStatus,
        })),
    );

    console.log("======================================");

    return result;
};

export const findAllQualityChecks = () => {
    return PurchaseQualityCheckModel.find({
        isDeleted: false,
    })
        .populate({
            path: "purchaseEntry",
            populate: {
                path: "vendor",
                model: VendorModel,
            },
        })
        .populate({
            path: "checkedBy",
            model: UserModel,
            select: "firstName lastName email",
        })
        .sort({
            createdAt: -1,
        })
        .lean();
};

export interface StockListParams {
    page: number;
    limit: number;
    search?: string;
}


export interface StockListParams {
    page: number;
    limit: number;
    search?: string;
}
export const findAllStock = async ({
    page,
    limit,
    search,
}: StockListParams) => {
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
        {
            $match: {
                $or: [
                    { isDeleted: false },
                    { isDeleted: { $exists: false } },
                ],
            },
        },
        {
            $unwind: "$products",
        },
        {
            $lookup: {
                from: "purchaseentries",
                localField: "purchaseEntry",
                foreignField: "_id",
                as: "purchaseEntry",
            },
        },
        {
            $unwind: "$purchaseEntry",
        },
        {
            $match: {
                $or: [
                    { "purchaseEntry.isDeleted": false },
                    { "purchaseEntry.isDeleted": { $exists: false } },
                ],
            },
        },
        {
            $unwind: "$purchaseEntry.products",
        },
        {
            $match: {
                $expr: {
                    $and: [
                        {
                            $eq: [
                                "$purchaseEntry.products._id",
                                "$products.purchaseEntryProduct",
                            ],
                        },
                        {
                            $eq: [
                                "$purchaseEntry.products.qcStatus",
                                "Done",
                            ],
                        },
                    ],
                },
            },
        },
        {
            $lookup: {
                from: "vendors",
                localField: "purchaseEntry.vendor",
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
            $lookup: {
                from: "products",
                localField: "products.product",
                foreignField: "_id",
                as: "productDetails",
            },
        },
        {
            $unwind: {
                path: "$productDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: StockModel.collection.name,
                let: {
                    productId: "$products.product",
                },
                pipeline: [
                    {
                        $match: {
                            isDeleted: false,
                            $expr: {
                                $eq: ["$product", "$$productId"],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            product: 1,
                            minimumStockAlertQuantity: 1,
                            availableStockQuantity: 1,
                        },
                    },
                ],
                as: "stock",
            },
        },
        {
            $unwind: {
                path: "$stock",
                preserveNullAndEmptyArrays: true,
            },
        },
    ];

    if (search?.trim()) {
        const escapedSearch = search
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const searchRegex = new RegExp(escapedSearch, "i");

        pipeline.push({
            $match: {
                $or: [
                    {
                        "productDetails.name": searchRegex,
                    },
                    {
                        "purchaseEntry.invoiceNo": searchRegex,
                    },
                    {
                        "vendor.vendorName": searchRegex,
                    },
                ],
            },
        });
    }

    pipeline.push(
        {
            $project: {
                _id: "$products._id",
                stockId: "$stock._id",
                purchaseEntryId: "$purchaseEntry._id",
                invoiceNo: "$purchaseEntry.invoiceNo",
                purchaseDate: "$purchaseEntry.purchaseDate",
                product: "$products.product",
                productName: "$productDetails.name",
                vendor: "$vendor.vendorName",
                purchaseQty: "$products.totalQty",
                purchaseQtyAfterQC: "$products.approvedQty",
                damageQty: "$products.damageQty",
                availableQtyAfterQC: "$products.availableQtyAfterQC",
                availableStockQuantityAfterBill: {
                    $ifNull: ["$stock.availableStockQuantity", 0],
                },
                minimumStockAlertQuantity: {
                    $ifNull: ["$stock.minimumStockAlertQuantity", 0],
                },
                shortFall: {
                    $subtract: [
                        {
                            $ifNull: ["$stock.availableStockQuantity", 0],
                        },
                        {
                            $ifNull: ["$stock.minimumStockAlertQuantity", 0],
                        },
                    ],
                },
                purchaseRate: "$products.purchaseRate",
                sellingPrice: {
                    $ifNull: ["$products.sellingPrice", null],
                },
                stockValue: {
                    $multiply: [
                        {
                            $ifNull: ["$stock.availableStockQuantity", 0],
                        },
                        {
                            $ifNull: ["$products.purchaseRate", 0],
                        },
                    ],
                },
            },
        },
        {
            $sort: {
                purchaseDate: -1,
                invoiceNo: 1,
                productName: 1,
            },
        },
        {
            $facet: {
                data: [
                    {
                        $skip: skip,
                    },
                    {
                        $limit: limit,
                    },
                ],
                totalCount: [
                    {
                        $count: "totalRecords",
                    },
                ],
            },
        },
    );

    const [result] = await PurchaseQualityCheckModel.aggregate(pipeline);

    return {
        data: result?.data ?? [],
        totalRecords: result?.totalCount?.[0]?.totalRecords ?? 0,
    };
};