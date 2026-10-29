import { Router } from "express";
import * as reportsController from "./reportsController";
import verifyToken from "../../middleware/verifyToken";

const router = Router();

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   - name: Reports
 *     description: Purchase entry, debit, and damage product reports
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PurchaseEntryReport:
 *       type: object
 *       properties:
 *         purchaseEntry:
 *           type: object
 *           description: Purchase entry details including vendor and products
 *         qualityCheck:
 *           type: object
 *           nullable: true
 *           description: Purchase quality check details
 *         paymentEntries:
 *           type: array
 *           description: Payment entries associated with the purchase entry
 *           items:
 *             type: object
 */

/**
 * @swagger
 * /api/reports/purchase-entry:
 *   get:
 *     summary: Get all purchase entry reports
 *     description: Fetches purchase entry details with vendor, quality check, and payment details.
 *     tags:
 *       - Reports
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
 *     responses:
 *       200:
 *         description: Purchase entry reports fetched successfully
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/purchase-entry",
    reportsController.getAllPurchaseEntryReports,
);

/**
 * @swagger
 * /api/reports/debit:
 *   get:
 *     summary: Get all debit reports
 *     description: Retrieves paginated debit records from payment entries and daily expenses, sorted by report date.
 *     tags:
 *       - Reports
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
 *     responses:
 *       200:
 *         description: Debit reports retrieved successfully
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/debit",
    reportsController.getAllDebitReportsController,
);

/**
 * @swagger
 * /api/reports/damage-products:
 *   get:
 *     summary: Get all damage product reports
 *     description: Fetches damaged products from sales returns and purchase quality checks, including related bill, customer, purchase entry, and vendor details.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Number of records per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Damage product reports fetched successfully
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/damage-products",
    reportsController.getAllDamageProductReportsController,
);

export default router;