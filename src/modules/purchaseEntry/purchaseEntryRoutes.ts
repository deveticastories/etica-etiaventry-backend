import { Router } from "express";
import verifyToken from "../../middleware/verifyToken";
import {
    createPurchaseEntryController,
    getAllPurchaseEntriesController,
    getPurchaseEntryByIdController,
    updatePurchaseEntryController,
    updatePurchaseEntryQCController,
    deletePurchaseEntryController,
    getProductDetailsByBarcodeController,
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
 *     responses:
 *       201:
 *         description: Purchase entry created successfully
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
 * /api/purchase-entries/product/barcode/{barcode}:
 *   get:
 *     summary: Get product details by barcode
 *     tags: [Purchase Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *         description: Product barcode
 *     responses:
 *       200:
 *         description: Product details fetched successfully
 *       400:
 *         description: Product barcode is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No product found for the supplied barcode
 *       500:
 *         description: Failed to fetch product details
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
 *                 enum:
 *                   - Pending
 *                   - Done
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

router.get(
    "/product/barcode/:barcode",
    verifyToken,
    getProductDetailsByBarcodeController,
);

router.get("/:id", verifyToken, getPurchaseEntryByIdController);

router.put("/:id", verifyToken, updatePurchaseEntryController);

router.patch("/:id/qc-status", verifyToken, updatePurchaseEntryQCController);

router.delete("/:id", verifyToken, deletePurchaseEntryController);

export default router;