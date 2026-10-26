import mongoose from "mongoose";
import RoleModel, { type RoleDocument } from "../../models/roleModel";
import { getPaginationMeta } from "../../utils/pagination";

export const create = async (
    roleData: Partial<RoleDocument>,
): Promise<RoleDocument> => {
    const role = new RoleModel(roleData);

    return await role.save();
};

export const findById = async (
    id: string,
): Promise<RoleDocument | null> => {
    return RoleModel.findOne({
        _id: id,
        isDeleted: false,
    }).exec();
};

export const updateById = async (
    id: string,
    updateData: Partial<RoleDocument>,
): Promise<RoleDocument | null> => {
    return RoleModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updateData },
        { returnDocument: "after", runValidators: true },
    ).exec();
};
export const getAllRoles = async (
    page: number,
    limit: number,
) => {
    const skip = (page - 1) * limit;

    const [roles, totalRecords] = await Promise.all([
        RoleModel.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),

        RoleModel.countDocuments({ isDeleted: false }).exec(),
    ]);

    return {
        data: roles,
        pagination: getPaginationMeta(page, limit, totalRecords),
    };
};

export const deleteRole = async (
    roleId: string,
    deletedBy: mongoose.Types.ObjectId,
): Promise<RoleDocument | null> => {
    return RoleModel.findOneAndUpdate(
        { _id: roleId, isDeleted: false },
        {
            $set: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy,
            },
        },
        { new: true },
    ).exec();
};

export const changeRoleStatus = async (
    id: string,
    updatedData: Partial<RoleDocument>,
): Promise<RoleDocument | null> => {
    return RoleModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
            $set: {
                status: updatedData.status,
            },
        },
        {
            new: true,
            runValidators: true,
        },
    ).exec();
};

export const findByRoleName = async (
    roleName: string,
): Promise<RoleDocument | null> => {
    return RoleModel.findOne({
        roleName: roleName.trim(),
        isDeleted: false,
    }).exec();
};