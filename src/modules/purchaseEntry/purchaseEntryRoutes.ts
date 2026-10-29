import { Router } from "express";
import verifyToken from "../../middleware/verifyToken";
import {
    createPurchaseEntryController,
    getAllPurchaseEntriesController,
    getPurchaseEntryByIdController,
    updatePurchaseEntryController,
    updatePurchaseEntryQCController,
    deletePurchaseEntryController,
} from "./purchaseEntryController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Purchase Entries
 *   description: Purchase entry management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PurchaseEntryProduct:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "671a12345678901234567891"
 *         productName:
 *           type: string
 *           example: "Cotton Fabric"
 *         minimumStockAlertQuantity:
 *           type: number
 *           example: 3
 *         purchaseQty:
 *           type: number
 *           example: 12
 *         purchaseRate:
 *           type: number
 *           example: 25.5
 *         amount:
 *           type: number
 *           example: 306
 *
 *     PurchaseEntry:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "671a12345678901234567890"
 *         invoiceNo:
 *           type: string
 *           example: "PUR-0001"
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *         vendor:
 *           type: string
 *           example: "671a12345678901234567892"
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PurchaseEntryProduct'
 *         totalProductQty:
 *           type: number
 *           example: 12
 *         totalAmount:
 *           type: number
 *           example: 306
 *         totalIncludingGST:
 *           type: number
 *           example: 321.3
 *         qcStatus:
 *           type: string
 *           enum: [Pending, Done]
 *
 *     Stock:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "671a12345678901234567893"
 *         purchaseEntryProduct:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - "671a12345678901234567891"
 *             - "671a12345678901234567894"
 *         productName:
 *           type: string
 *           example: "Cotton Fabric"
 *         minimumStockAlertQuantity:
 *           type: number
 *           example: 3
 *         availableStockQuantity:
 *           type: number
 *           example: 22
 *
 *     CreatePurchaseEntry:
 *       type: object
 *       required:
 *         - purchaseDate
 *         - vendor
 *         - products
 *         - totalIncludingGST
 *       properties:
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *           example: "2026-10-24T00:00:00.000Z"
 *         vendor:
 *           type: string
 *           example: "671a12345678901234567892"
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - productName
 *               - minimumStockAlertQuantity
 *               - purchaseQty
 *               - purchaseRate
 *             properties:
 *               productName:
 *                 type: string
 *                 example: "Cotton Fabric"
 *               minimumStockAlertQuantity:
 *                 type: number
 *                 example: 3
 *               purchaseQty:
 *                 type: number
 *                 example: 12
 *               purchaseRate:
 *                 type: number
 *                 example: 25.5
 *         totalIncludingGST:
 *           type: number
 *           example: 321.3
 *
 *     UpdatePurchaseEntry:
 *       type: object
 *       properties:
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *         vendor:
 *           type: string
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               minimumStockAlertQuantity:
 *                 type: number
 *               purchaseQty:
 *                 type: number
 *               purchaseRate:
 *                 type: number
 *         totalIncludingGST:
 *           type: number
 */

/**
 * @swagger
 * /api/purchase-entries:
 *   post:
 *     summary: Create a purchase entry and update stock
 *     tags: [Purchase Entries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePurchaseEntry'
 *     responses:
 *       201:
 *         description: Purchase entry created and stock updated successfully
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
 *                   example: Purchase entry created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     purchaseEntry:
 *                       $ref: '#/components/schemas/PurchaseEntry'
 *                     stockDetails:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Stock'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Failed to create purchase entry
 *
 *   get:
 *     summary: Get all purchase entries with pagination
 *     tags: [Purchase Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Purchase entries fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch purchase entries
 */

/**
 * @swagger
 * /api/purchase-entries/{id}:
 *   get:
 *     summary: Get a purchase entry by ID
 *     tags: [Purchase Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase entry MongoDB ID
 *     responses:
 *       200:
 *         description: Purchase entry fetched successfully
 *       400:
 *         description: Invalid purchase entry ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Purchase entry not found
 *       500:
 *         description: Failed to fetch purchase entry
 *
 *   put:
 *     summary: Update a purchase entry
 *     tags: [Purchase Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase entry MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePurchaseEntry'
 *     responses:
 *       200:
 *         description: Purchase entry updated successfully
 *       400:
 *         description: Invalid purchase entry ID or request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Purchase entry or vendor not found
 *       500:
 *         description: Failed to update purchase entry
 *
 *   delete:
 *     summary: Soft delete a purchase entry
 *     tags: [Purchase Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase entry MongoDB ID
 *     responses:
 *       200:
 *         description: Purchase entry deleted successfully
 *       400:
 *         description: Invalid purchase entry ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Purchase entry not found
 *       500:
 *         description: Failed to delete purchase entry
 */

/**
 * @swagger
 * /api/purchase-entries/{id}/qc-status:
 *   patch:
 *     summary: Update purchase quality check status
 *     tags: [Purchase Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase entry MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qcStatus
 *             properties:
 *               qcStatus:
 *                 type: string
 *                 enum: [Pending, Done]
 *     responses:
 *       200:
 *         description: Purchase quality check status updated successfully
 *       400:
 *         description: Invalid purchase entry ID or QC status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Purchase entry not found
 *       500:
 *         description: Failed to update QC status
 */

router.post("/", verifyToken, createPurchaseEntryController);
router.get("/", verifyToken, getAllPurchaseEntriesController);
router.get("/:id", verifyToken, getPurchaseEntryByIdController);
router.put("/:id", verifyToken, updatePurchaseEntryController);
router.patch("/:id/qc-status", verifyToken, updatePurchaseEntryQCController);
router.delete("/:id", verifyToken, deletePurchaseEntryController);

export default router;