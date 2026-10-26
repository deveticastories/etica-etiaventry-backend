import { Response } from "express";
import * as roleService from "./roleService";
import { RequestWithAuthData } from "../../@types/express";
import { message } from "../../constants/responseMessage";
import { statusCode } from "../../constants/statusCode";
import { paginatedResponse } from "../../utils/response";
import { getPaginationParams } from "../../utils/pagination";

export const createRole = async (
    req: RequestWithAuthData,
    res: Response,
) => {
    try {
        if (!req.userId) {
            return res.status(statusCode.UNAUTHORIZED).json({
                success: false,
                message: message.UNAUTHORIZED,
            });
        }

        const roleData = {
            ...req.body,
            createdBy: req.userId,
        };

        const createdRole = await roleService.createRole(roleData);

        return res.status(statusCode.CREATED).json({
            success: true,
            message: message.ROLE_CREATED,
            role: createdRole,
        });
    } catch (error: unknown) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : message.INTERNAL_SERVER_ERROR,
        });
    }
};

export const editRole = async (
    req: RequestWithAuthData,
    res: Response,
) => {
    const { id } = req.params;

    if (!req.userId) {
        return res.status(statusCode.UNAUTHORIZED).json({
            success: false,
            message: message.UNAUTHORIZED,
        });
    }

    if (typeof id !== "string") {
        return res.status(statusCode.BAD_REQUEST).json({
            success: false,
            message: message.INVALID_ROLE_ID,
        });
    }

    try {
        const existingRole = await roleService.getRoleById(id);

        if (!existingRole) {
            return res.status(statusCode.NOT_FOUND).json({
                success: false,
                message: message.ROLE_NOT_FOUND,
            });
        }

        const roleData = {
            ...req.body,
            updatedBy: req.userId,
            userUpdatedDate: new Date(),
        };

        const updatedRole = await roleService.editRole(id, roleData);

        return res.status(statusCode.OK).json({
            success: true,
            message: message.ROLE_UPDATED,
            role: updatedRole,
        });
    } catch (error: unknown) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : message.INTERNAL_SERVER_ERROR,
        });
    }
};

export const deleteRole = async (
    req: RequestWithAuthData,
    res: Response,
) => {
    const { id } = req.params;

    try {
        if (!req.userId) {
            return res.status(statusCode.UNAUTHORIZED).json({
                success: false,
                message: message.UNAUTHORIZED,
            });
        }

        if (typeof id !== "string") {
            return res.status(statusCode.BAD_REQUEST).json({
                success: false,
                message: message.INVALID_ROLE_ID,
            });
        }

        const deletedRole = await roleService.deleteRole(
            id,
            req.userId,
        );

        if (!deletedRole) {
            return res.status(statusCode.NOT_FOUND).json({
                success: false,
                message: message.ROLE_NOT_FOUND,
            });
        }

        return res.status(statusCode.OK).json({
            success: true,
            message: message.ROLE_DELETED,
        });
    } catch (error: unknown) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : message.INTERNAL_SERVER_ERROR,
        });
    }
};

export const getRoleById = async (
    req: RequestWithAuthData,
    res: Response,
) => {
    const { id } = req.params;

    try {
        if (!req.userId) {
            return res.status(statusCode.UNAUTHORIZED).json({
                success: false,
                message: message.UNAUTHORIZED,
            });
        }

        if (typeof id !== "string") {
            return res.status(statusCode.BAD_REQUEST).json({
                success: false,
                message: message.INVALID_ROLE_ID,
            });
        }

        const role = await roleService.getRoleById(id);

        if (!role) {
            return res.status(statusCode.NOT_FOUND).json({
                success: false,
                message: message.ROLE_NOT_FOUND,
            });
        }

        return res.status(statusCode.OK).json({
            success: true,
            role,
        });
    } catch (error: unknown) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : message.INTERNAL_SERVER_ERROR,
        });
    }
};

export const getAllRoles = async (
    req: RequestWithAuthData,
    res: Response,
) => {
    try {
        if (!req.userId) {
            return res.status(statusCode.UNAUTHORIZED).json({
                success: false,
                message: message.UNAUTHORIZED,
            });
        }

        let paginationParams;

        try {
            paginationParams = getPaginationParams(req.query);
        } catch (error: unknown) {
            return res.status(statusCode.BAD_REQUEST).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : message.INVALID_PAGINATION,
            });
        }

        const result = await roleService.getAllRoles(
            paginationParams.page,
            paginationParams.limit,
        );

        return res.status(statusCode.OK).json(
            paginatedResponse(result.data, result.pagination),
        );
    } catch (error: unknown) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : message.INTERNAL_SERVER_ERROR,
        });
    }
};

export const updateRoleStatus = async (
    req: RequestWithAuthData,
    res: Response,
) => {
    const { id } = req.params;

    if (!req.userId) {
        return res.status(statusCode.UNAUTHORIZED).json({
            success: false,
            message: message.UNAUTHORIZED,
        });
    }

    if (typeof id !== "string") {
        return res.status(statusCode.BAD_REQUEST).json({
            success: false,
            message: message.INVALID_ROLE_ID,
        });
    }

    try {
        const roleStatusUpdateData = {
            ...req.body,
            updatedBy: req.userId,
            userUpdatedDate: new Date(),
        };

        const updatedRole = await roleService.updateRoleStatus(
            id,
            roleStatusUpdateData,
        );

        if (!updatedRole) {
            return res.status(statusCode.NOT_FOUND).json({
                success: false,
                message: message.ROLE_NOT_FOUND,
            });
        }

        return res.status(statusCode.OK).json({
            success: true,
            message: message.ROLE_STATUS_UPDATED,
            role: updatedRole,
        });
    } catch (error: unknown) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : message.INTERNAL_SERVER_ERROR,
        });
    }
};