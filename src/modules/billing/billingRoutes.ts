import { Router } from "express";
import verifyToken from "../../middleware/verifyToken";
import {
    createBilling,
    getAllBillings,
    getBillingById,
    updateBillingPaymentStatus,
} from "./billingController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Billing
 *   description: Billing management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BillingProductInput:
 *       type: object
 *       required:
 *         - stock
 *         - qty
 *         - sellingPrice
 *       properties:
 *         stock:
 *           type: string
 *           description: Stock document ObjectId
 *           example: "671a2b3c4d5e6f7890123456"
 *         qty:
 *           type: number
 *           minimum: 1
 *           example: 2
 *         sellingPrice:
 *           type: number
 *           minimum: 0
 *           example: 350
 *
 *     CreateBilling:
 *       type: object
 *       required:
 *         - customer
 *         - products
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2026-10-26T10:00:00.000Z"
 *         customer:
 *           type: string
 *           description: User document ObjectId for the customer
 *           example: "671a2b3c4d5e6f7890123456"
 *         defaultMargin:
 *           type: number
 *           minimum: 0
 *           example: 25
 *         products:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: "#/components/schemas/BillingProductInput"
 *
 *     BillingProductResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "671a2b3c4d5e6f7890123456"
 *         stock:
 *           type: string
 *           example: "671a2b3c4d5e6f7890123456"
 *         productName:
 *           type: string
 *           example: "Cotton Kurta"
 *         availableQty:
 *           type: number
 *           example: 18
 *         qty:
 *           type: number
 *           example: 2
 *         sellingPrice:
 *           type: number
 *           example: 350
 *
 *     BillingResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         invoiceNo:
 *           type: string
 *           example: "INV-0001"
 *         date:
 *           type: string
 *           format: date-time
 *         customer:
 *           type: string
 *         defaultMargin:
 *           type: number
 *           example: 25
 *         products:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/BillingProductResponse"
 *         totalQty:
 *           type: number
 *           example: 2
 *         invoiceTotal:
 *           type: number
 *           example: 700
 *         isPaymentReceived:
 *           type: boolean
 *           default: false
 *           example: false
 *
 *     UpdateBillingPaymentStatus:
 *       type: object
 *       required:
 *         - isPaymentReceived
 *       properties:
 *         isPaymentReceived:
 *           type: boolean
 *           description: Set true when payment is received or false when unpaid
 *           example: true
 *
 *     BillingPagination:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalRecords:
 *           type: integer
 *           example: 25
 *         totalPages:
 *           type: integer
 *           example: 3
 *         hasPreviousPage:
 *           type: boolean
 *           example: false
 *         hasNextPage:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /api/billing:
 *   post:
 *     summary: Create a billing invoice
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateBilling"
 *     responses:
 *       201:
 *         description: Billing invoice created successfully
 *       400:
 *         description: Invalid input or insufficient stock
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", verifyToken, createBilling);

/**
 * @swagger
 * /api/billing:
 *   get:
 *     summary: Get all billing invoices
 *     tags: [Billing]
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
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by invoice number
 *     responses:
 *       200:
 *         description: Billing invoices fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", verifyToken, getAllBillings);

/**
 * @swagger
 * /api/billing/{id}:
 *   get:
 *     summary: Get a billing invoice by ID
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Billing invoice ObjectId
 *     responses:
 *       200:
 *         description: Billing invoice fetched successfully
 *       400:
 *         description: Invalid billing ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Billing invoice not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", verifyToken, getBillingById);

/**
 * @swagger
 * /api/billing/{id}/payment-status:
 *   patch:
 *     summary: Update billing payment received status
 *     description: Updates only the isPaymentReceived field of a billing invoice.
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Billing invoice ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateBillingPaymentStatus"
 *     responses:
 *       200:
 *         description: Billing payment status updated successfully
 *       400:
 *         description: Invalid billing ID or payment status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Billing invoice not found
 *       500:
 *         description: Internal server error
 */
router.patch(
    "/:id/payment-status",
    verifyToken,
    updateBillingPaymentStatus,
);

export default router;