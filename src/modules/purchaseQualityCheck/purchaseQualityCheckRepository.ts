import mongoose from "mongoose";
import PurchaseQualityCheckModel from "../../models/purchaseQualityCheckModel";
import PurchaseEntryModel from "../../models/purchaseEntryModel";
import VendorModel from "../../models/vendorModel";
import UserModel from "../../models/userModel";
import StockModel from "../../models/stockModel"
export const findPurchaseEntryById = (id: string) => {
    return PurchaseEntryModel.findOne({
        _id: id,
        isDeleted: false,
    }).lean();
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

export const updatePurchaseEntryQCStatus = (id: string) => {
    return PurchaseEntryModel.findOneAndUpdate(
        {
            _id: id,
            isDeleted: false,
        },
        {
            $set: {
                qcStatus: "Done",
            },
        },
        {
            new: true,
            runValidators: true,
        },
    );
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
                isDeleted: false,
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
                "purchaseEntry.isDeleted": false,
                "purchaseEntry.qcStatus": "Done",
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
                from: StockModel.collection.name,
                let: {
                    productName: "$products.productName",
                },
                pipeline: [
                    {
                        $match: {
                            isDeleted: false,
                            $expr: {
                                $eq: ["$productName", "$$productName"],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            productName: 1,
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
                        "products.productName": searchRegex,
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
                invoiceNo: "$purchaseEntry.invoiceNo",
                purchaseDate: "$purchaseEntry.purchaseDate",
                productName: "$products.productName",
                vendor: "$vendor.vendorName",
                purchaseQtyAfterQC: "$products.approvedQty",
                availableQtyAfterQC: "$products.availableQtyAfterQC",
                availableStockQuantityAfterBill: {
                    $ifNull: ["$stock.availableStockQuantity", 0],
                },
                minimumStockAlertQuantity: {
                    $ifNull: ["$stock.minimumStockAlertQuantity", 0],
                },
                purchaseRate: "$products.purchaseRate",
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