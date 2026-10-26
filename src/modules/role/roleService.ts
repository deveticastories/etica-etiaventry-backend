import logger from "../../utils/logger";
import * as roleRepository from "./roleRepository";
import { type RoleDocument } from "../../models/roleModel";
import mongoose from "mongoose";

export const createRole = async (
  roleData: Partial<RoleDocument>,
): Promise<RoleDocument> => {
  try {
    logger.info("Creating a new role", { roleData });

    if (roleData.roleName) {
      const existingRole = await roleRepository.findByRoleName(
        roleData.roleName,
      );

      if (existingRole) {
        throw new Error(
          `Role with name '${roleData.roleName}' already exists.`,
        );
      }
    }

    const newRole = await roleRepository.create(roleData);

    logger.info("Role created successfully", {
      roleId: newRole._id,
      roleName: newRole.roleName,
    });

    return newRole;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create role.";

    logger.error("Error creating role", {
      error: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

export const editRole = async (
  roleId: string,
  roleData: Partial<RoleDocument>,
): Promise<RoleDocument | null> => {
  try {
    logger.info(`Editing role with ID ${roleId}`, { roleData });

    if (roleData.roleName) {
      const existingRole = await roleRepository.findByRoleName(
        roleData.roleName,
      );

      if (existingRole && existingRole._id.toString() !== roleId) {
        throw new Error(
          `Role with name '${roleData.roleName}' already exists.`,
        );
      }
    }

    const updatedRole = await roleRepository.updateById(roleId, roleData);

    if (!updatedRole) {
      throw new Error(`Role with ID ${roleId} not found.`);
    }

    logger.info("Role updated successfully", {
      roleId: updatedRole._id,
      roleName: updatedRole.roleName,
    });

    return updatedRole;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update role.";

    logger.error("Error updating role", {
      roleId,
      error: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

export const getAllRoles = async (
  page: number,
  limit: number,
) => {
  logger.info("Getting roles with pagination", { page, limit });

  return roleRepository.getAllRoles(page, limit);
};

export const getRoleById = async (
  id: string,
): Promise<RoleDocument | null> => {
  logger.info(`Getting role with ID ${id}`);

  return roleRepository.findById(id);
};

export const deleteRole = async (
  roleId: string,
  deletedBy: mongoose.Types.ObjectId,
): Promise<RoleDocument | null> => {
  try {
    logger.info(`Deleting role with ID ${roleId}`);

    const deletedRole = await roleRepository.deleteRole(roleId, deletedBy);

    if (!deletedRole) {
      throw new Error(`Role with ID ${roleId} not found.`);
    }

    logger.info("Role deleted successfully", { roleId });

    return deletedRole;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete role.";

    logger.error("Error deleting role", {
      roleId,
      error: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

export const updateRoleStatus = async (
  id: string,
  updatedData: Partial<RoleDocument>,
): Promise<RoleDocument | null> => {
  try {
    logger.info(
      `Updating status for role with ID ${id} to ${updatedData.status}`,
    );

    const updatedRole = await roleRepository.changeRoleStatus(id, updatedData);

    if (!updatedRole) {
      throw new Error(`Role with ID ${id} not found.`);
    }

    logger.info("Role status updated successfully", {
      roleId: id,
      status: updatedData.status,
    });

    return updatedRole;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update role status.";

    logger.error("Error updating role status", {
      roleId: id,
      error: errorMessage,
    });

    throw new Error(errorMessage);
  }
};