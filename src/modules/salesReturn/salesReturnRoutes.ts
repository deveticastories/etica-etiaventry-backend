import { Router } from "express";
import verifyToken from "../../middleware/verifyToken";
import {
    createSalesReturnController,
    getAllSalesReturnsController,
    getSalesReturnByIdController,
    updateSalesReturnController,
    deleteSalesReturnController,
    approveSalesReturnController,
} from "./salesReturnController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sales Returns
 *   description: Sales return management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSalesReturn:
 *       type: object
 *       required:
 *         - bill
 *         - billingProductId
 *         - returnType
 *         - reason
 *         - returnQuantity
 *       properties:
 *         bill:
 *           type: string
 *           description: Billing document ObjectId
 *           example: "671234567890123456789012"
 *         billingProductId:
 *           type: string
 *           description: Product subdocument ObjectId from the billing document
 *           example: "671234567890123456789013"
 *         returnType:
 *           type: string
 *           enum: [Full, Partial]
 *           example: Partial
 *         reason:
 *           type: string
 *           enum: [Size Issue, Damage, Other]
 *           example: Size Issue
 *         returnQuantity:
 *           type: number
 *           minimum: 1
 *           example: 2
 *     UpdateSalesReturn:
 *       type: object
 *       properties:
 *         bill:
 *           type: string
 *           example: "671234567890123456789012"
 *         billingProductId:
 *           type: string
 *           example: "671234567890123456789013"
 *         returnType:
 *           type: string
 *           enum: [Full, Partial]
 *         reason:
 *           type: string
 *           enum: [Size Issue, Damage, Other]
 *         returnQuantity:
 *           type: number
 *           minimum: 1
 *     SalesReturnResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         bill:
 *           type: object
 *         billingProductId:
 *           type: string
 *         returnType:
 *           type: string
 *           enum: [Full, Partial]
 *         reason:
 *           type: string
 *           enum: [Size Issue, Damage, Other]
 *         returnQuantity:
 *           type: number
 *         invoiceValue:
 *           type: number
 *           description: Original invoice total, calculated automatically
 *         updatedInvoiceValue:
 *           type: number
 *           description: Adjusted invoice value, calculated automatically
 *         isApproved:
 *           type: boolean
 */

/**
 * @swagger
 * /api/sales-returns:
 *   post:
 *     summary: Create a sales return
 *     tags: [Sales Returns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSalesReturn'
 *     responses:
 *       201:
 *         description: Sales return created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post("/", verifyToken, createSalesReturnController);

/**
 * @swagger
 * /api/sales-returns:
 *   get:
 *     summary: Get all sales returns with pagination
 *     tags: [Sales Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by sales return ID, billing ID, or return type
 *     responses:
 *       200:
 *         description: Sales returns fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", verifyToken, getAllSalesReturnsController);

/**
 * @swagger
 * /api/sales-returns/{id}:
 *   get:
 *     summary: Get a sales return by ID
 *     tags: [Sales Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sales return fetched successfully
 *       404:
 *         description: Sales return not found
 */
router.get("/:id", verifyToken, getSalesReturnByIdController);

/**
 * @swagger
 * /api/sales-returns/{id}:
 *   put:
 *     summary: Update a sales return
 *     tags: [Sales Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSalesReturn'
 *     responses:
 *       200:
 *         description: Sales return updated successfully
 *       400:
 *         description: Invalid request or approval must use the approval endpoint
 *       404:
 *         description: Sales return not found
 */
router.put("/:id", verifyToken, updateSalesReturnController);

/**
 * @swagger
 * /api/sales-returns/{id}/approve:
 *   patch:
 *     summary: Approve a sales return and restore stock when applicable
 *     tags: [Sales Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sales return approved successfully
 *       400:
 *         description: Return cannot be approved or has already been approved
 *       404:
 *         description: Sales return or stock not found
 */
router.patch("/:id/approve", verifyToken, approveSalesReturnController);

/**
 * @swagger
 * /api/sales-returns/{id}:
 *   delete:
 *     summary: Soft-delete a sales return
 *     tags: [Sales Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sales return deleted successfully
 *       404:
 *         description: Sales return not found
 */
router.delete("/:id", verifyToken, deleteSalesReturnController);

export default router;