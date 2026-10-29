import logger from "../../utils/logger";
import * as userRepository from "./userRepository";
import { type UserDocument } from "../../models/userModel";
import RoleModel from "../../models/roleModel";
import mongoose from "mongoose";
import bcrypt from "bcrypt";


export const createUser = async (
  userData: Partial<UserDocument>,
): Promise<UserDocument> => {
  try {
    logger.info("Creating a new user", { userData });

    userData.email = userData.email?.trim().toLowerCase();

    if (userData.email) {
      const existingUser = await userRepository.findByEmail(userData.email);

      if (existingUser) {
        throw new Error(`User with email '${userData.email}' already exists.`);
      }
    }

    if (userData.employeeId) {
      const existingUser = await userRepository.findByEmployeeId(
        userData.employeeId,
      );

      if (existingUser) {
        throw new Error(
          `User with employee ID '${userData.employeeId}' already exists.`,
        );
      }
    }

    if (userData.mobileNumber) {
      const existingUser = await userRepository.findByMobileNumber(
        userData.mobileNumber,
      );

      if (existingUser) {
        throw new Error(
          `User with mobile number '${userData.mobileNumber}' already exists.`,
        );
      }
    }

    if (!userData.role) {
      throw new Error("Role is required.");
    }

    const roleId = userData.role.toString();

    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      throw new Error("Invalid role ID.");
    }

    const role = await RoleModel.findOne({
      _id: roleId,
      isDeleted: false,
      status: true,
    });

    if (!role) {
      throw new Error("Role not found or inactive.");
    }

    if (!userData.password) {
      throw new Error("Password is required.");
    }

    userData.password = await bcrypt.hash(userData.password, 12);

    const newUser = await userRepository.create(userData);

    logger.info("User created successfully", {
      userId: newUser._id,
      email: newUser.email,
    });

    return newUser;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create user.";

    logger.error("Error creating user", {
      error: errorMessage,
    });

    throw new Error(errorMessage);
  }
};
export const editUser = async (
  userId: string,
  userData: Partial<UserDocument>,
): Promise<UserDocument | null> => {
  try {
    logger.info(`Editing user with ID ${userId}`, { userData });

    if (userData.email) {
      const existingUser = await userRepository.findByEmail(userData.email);

      if (existingUser && existingUser._id.toString() !== userId) {
        throw new Error(`User with email '${userData.email}' already exists.`);
      }
    }

    if (userData.employeeId) {
      const existingUser = await userRepository.findByEmployeeId(
        userData.employeeId,
      );

      if (existingUser && existingUser._id.toString() !== userId) {
        throw new Error(
          `User with employee ID '${userData.employeeId}' already exists.`,
        );
      }
    }

    if (userData.mobileNumber) {
      const existingUser = await userRepository.findByMobileNumber(
        userData.mobileNumber,
      );

      if (existingUser && existingUser._id.toString() !== userId) {
        throw new Error(
          `User with mobile number '${userData.mobileNumber}' already exists.`,
        );
      }
    }

    if (userData.role !== undefined) {
      const roleId = userData.role.toString();

      if (!mongoose.Types.ObjectId.isValid(roleId)) {
        throw new Error("Invalid role ID.");
      }

      const role = await RoleModel.findOne({
        _id: roleId,
        isDeleted: false,
        status: true,
      });

      if (!role) {
        throw new Error("Role not found or inactive.");
      }
    }

    const updatedUser = await userRepository.updateById(userId, userData);

    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    logger.info("User updated successfully", {
      userId: updatedUser._id,
    });

    return updatedUser;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update user.";

    logger.error("Error updating user", {
      userId,
      error: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

export const getAllUsers = async (page: number, limit: number) => {
  logger.info("Getting users with pagination", { page, limit });

  return userRepository.getAllUsers(page, limit);
};

export const getUserById = async (
  id: string,
): Promise<UserDocument | null> => {
  logger.info(`Getting user with ID ${id}`);

  return userRepository.findById(id);
};

export const deleteUser = async (
  userId: string,
  deletedBy: mongoose.Types.ObjectId,
): Promise<UserDocument | null> => {
  try {
    logger.info(`Deleting user with ID ${userId}`);

    const deletedUser = await userRepository.deleteUser(userId, deletedBy);

    if (!deletedUser) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    logger.info("User deleted successfully", { userId });

    return deletedUser;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete user.";

    logger.error("Error deleting user", {
      userId,
      error: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

export const updateUserStatus = async (
  id: string,
  updatedData: Partial<UserDocument>,
): Promise<UserDocument | null> => {
  try {
    logger.info(
      `Updating status for user with ID ${id} to ${updatedData.status}`,
    );

    const updatedUser = await userRepository.changeUserStatus(id, updatedData);

    if (!updatedUser) {
      throw new Error(`User with ID ${id} not found.`);
    }

    logger.info("User status updated successfully", {
      userId: id,
      status: updatedData.status,
    });

    return updatedUser;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update user status.";

    logger.error("Error updating user status", {
      userId: id,
      error: errorMessage,
    });

    throw new Error(errorMessage);
  }
};