import { Router } from "express";
import * as purchaseEntryController from "./purchaseEntryController";
import { validate } from "../../middleware/validate";
import {
    createPurchaseEntrySchema,
    updatePurchaseEntrySchema,
} from "../../validation/purchaseEntryValidation";
import verifyToken from "../../middleware/verifyToken";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Purchase Entries
 *   description: Purchase Entry management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PurchaseEntryProductInput:
 *       type: object
 *       required:
 *         - product
 *         - purchaseQty
 *         - purchaseRate
 *       properties:
 *         product:
 *           type: string
 *           description: Product ObjectId reference
 *           example: "671a2b3c4d5e6f7890123456"
 *         minimumStockAlertQuantity:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           example: 3
 *         purchaseQty:
 *           type: number
 *           minimum: 1
 *           example: 12
 *         purchaseRate:
 *           type: number
 *           minimum: 0
 *           example: 25.5
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
 *         store:
 *           type: string
 *           example: "671a12345678901234567891"
 *         products:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/PurchaseEntryProductInput'
 *         totalIncludingGST:
 *           type: number
 *           minimum: 0
 *           example: 321.3
 *
 *     UpdatePurchaseEntry:
 *       type: object
 *       properties:
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *           example: "2026-10-24T00:00:00.000Z"
 *         vendor:
 *           type: string
 *           example: "671a12345678901234567892"
 *         store:
 *           type: string
 *           example: "671a12345678901234567891"
 *         products:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/PurchaseEntryProductInput'
 *         totalIncludingGST:
 *           type: number
 *           minimum: 0
 *           example: 321.3
 *         qcStatus:
 *           type: string
 *           enum:
 *             - Pending
 *             - Done
 *           example: Pending
 *
 *     PurchaseEntryProduct:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "671a2b3c4d5e6f7890123457"
 *         product:
 *           type: object
 *           description: Populated Product details
 *           properties:
 *             _id:
 *               type: string
 *               example: "671a2b3c4d5e6f7890123456"
 *             name:
 *               type: string
 *               example: "Cotton Fabric"
 *      
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
 *           type: object
 *           description: Populated vendor details
 *         store:
 *           type: object
 *           description: Populated store details
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
 *           enum:
 *             - Pending
 *             - Done
 *           example: Pending
 *
 *     PurchaseEntryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Purchase entry created successfully
 *         data:
 *           $ref: '#/components/schemas/PurchaseEntry'
 *
 *     PurchaseEntryListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Purchase entries fetched successfully
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PurchaseEntry'
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: number
 *               example: 1
 *             limit:
 *               type: number
 *               example: 10
 *             totalRecords:
 *               type: number
 *               example: 25
 *             totalPages:
 *               type: number
 *               example: 3
 *             hasPreviousPage:
 *               type: boolean
 *               example: false
 *             hasNextPage:
 *               type: boolean
 *               example: true
 */

/**
 * @swagger
 * /api/purchase-entries:
 *   post:
 *     summary: Create a purchase entry
 *     tags: [Purchase Entries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePurchaseEntry'
 *           example:
 *             purchaseDate: "2026-10-24T00:00:00.000Z"
 *             vendor: "671a12345678901234567892"
 *             store: "671a12345678901234567891"
 *             products:
 *               - product: "671a2b3c4d5e6f7890123456"
 *                 minimumStockAlertQuantity: 3
 *                 purchaseQty: 12
 *                 purchaseRate: 25.5
 *             totalIncludingGST: 321.3
 *     responses:
 *       201:
 *         description: Purchase entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseEntryResponse'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/",
    verifyToken,
    validate(createPurchaseEntrySchema),
    purchaseEntryController.createPurchaseEntryController,
);

/**
 * @swagger
 * /api/purchase-entries:
 *   get:
 *     summary: Get all purchase entries
 *     tags: [Purchase Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase entries fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseEntryListResponse'
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/",
    verifyToken,
    purchaseEntryController.getAllPurchaseEntriesController,
);


/**
 * @swagger
 * /api/purchase-entries/{id}:
 *   get:
 *     summary: Get purchase entry by ID
 *     tags: [Purchase Entries]
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
 *         description: Purchase entry fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseEntryResponse'
 *       400:
 *         description: Invalid purchase entry ID
 *       404:
 *         description: Purchase entry not found
 */
router.get(
    "/:id",
    verifyToken,
    purchaseEntryController.getPurchaseEntryByIdController,
);

/**
 * @swagger
 * /api/purchase-entries/{id}:
 *   put:
 *     summary: Update purchase entry
 *     tags: [Purchase Entries]
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
 *             $ref: '#/components/schemas/UpdatePurchaseEntry'
 *     responses:
 *       200:
 *         description: Purchase entry updated successfully
 *       400:
 *         description: Invalid request data or purchase entry ID
 *       404:
 *         description: Purchase entry or vendor not found
 */
router.put(
    "/:id",
    verifyToken,
    validate(updatePurchaseEntrySchema),
    purchaseEntryController.updatePurchaseEntryController,
);

/**
 * @swagger
 * /api/purchase-entries/{id}/qc-status:
 *   patch:
 *     summary: Update purchase entry QC status
 *     tags: [Purchase Entries]
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
 *             type: object
 *             required:
 *               - qcStatus
 *             properties:
 *               qcStatus:
 *                 type: string
 *                 enum:
 *                   - Pending
 *                   - Done
 *                 example: Done
 *     responses:
 *       200:
 *         description: Purchase entry QC status updated successfully
 *       400:
 *         description: Invalid purchase entry ID
 *       404:
 *         description: Purchase entry not found
 */
router.patch(
    "/:id/qc-status",
    verifyToken,
    purchaseEntryController.updatePurchaseEntryQCController,
);

/**
 * @swagger
 * /api/purchase-entries/{id}:
 *   delete:
 *     summary: Delete purchase entry
 *     tags: [Purchase Entries]
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
 *         description: Purchase entry deleted successfully
 *       400:
 *         description: Invalid purchase entry ID
 *       404:
 *         description: Purchase entry not found
 */
router.delete(
    "/:id",
    verifyToken,
    purchaseEntryController.deletePurchaseEntryController,
);

export default router;
