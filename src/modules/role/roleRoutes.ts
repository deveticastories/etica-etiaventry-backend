import { Router } from "express";
import * as roleController from "./roleController";
import verifyToken from "../../middleware/verifyToken";
import { validate } from "../../middleware/validate";
import {
    createRoleValidation,
    updateRoleValidation,
    updateRoleStatusValidation,
} from "../../validation/roleValidation";

const router = Router();

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management APIs
 */

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRole'
 *           example:
 *             roleName: Purchaser
 *             modules:
 *               - Dashboard
 *               - Vendors
 *               - Purchase Data
 *               - Store Stock
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Role created successfully
 *                 role:
 *                   $ref: '#/components/schemas/RoleResponse'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Role name is required
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Role already exists
 */
router.post(
    "/",
    validate(createRoleValidation),
    roleController.createRole,
);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles with pagination
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of roles per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         example: 10
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedRolesResponse'
 *             example:
 *               success: true
 *               data:
 *                 - _id: 671a1234567890abcdef1234
 *                   roleName: Purchaser
 *                   modules:
 *                     - Dashboard
 *                     - Vendors
 *                     - Purchase Data
 *                   status: true
 *               pagination:
 *                 currentPage: 1
 *                 limit: 10
 *                 totalRecords: 1
 *                 totalPages: 1
 *                 hasPreviousPage: false
 *                 hasNextPage: false
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Unauthorized
 */
router.get("/", roleController.getAllRoles);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get a role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the role
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         example: 671a1234567890abcdef1234
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 role:
 *                   $ref: '#/components/schemas/RoleResponse'
 *       400:
 *         description: Invalid role ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 */
router.get("/:id", roleController.getRoleById);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the role
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         example: 671a1234567890abcdef1234
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRole'
 *           example:
 *             roleName: Senior Purchaser
 *             modules:
 *               - Dashboard
 *               - Vendors
 *               - Purchase Data
 *               - Store Stock
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Role updated successfully
 *                 role:
 *                   $ref: '#/components/schemas/RoleResponse'
 *       400:
 *         description: Validation failed or invalid role ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 *       409:
 *         description: Role name already exists
 */
router.put(
    "/:id",
    validate(updateRoleValidation),
    roleController.editRole,
);

/**
 * @swagger
 * /api/roles/{id}/status:
 *   patch:
 *     summary: Update role status
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the role
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         example: 671a1234567890abcdef1234
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleStatus'
 *           example:
 *             status: false
 *     responses:
 *       200:
 *         description: Role status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Role status updated successfully
 *                 role:
 *                   $ref: '#/components/schemas/RoleResponse'
 *       400:
 *         description: Validation failed or invalid role ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 */
router.patch(
    "/:id/status",
    validate(updateRoleStatusValidation),
    roleController.updateRoleStatus,
);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Soft-delete a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the role
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         example: 671a1234567890abcdef1234
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Role deleted successfully
 *       400:
 *         description: Invalid role ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 */
router.delete("/:id", roleController.deleteRole);

export default router;