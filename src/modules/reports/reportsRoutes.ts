import { Router } from "express";
import * as reportsController from "./reportsController";
import verifyToken from "../../middleware/verifyToken";

const router = Router();

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Purchase entry reports APIs
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
 *     description: Fetches purchase entry details along with vendor information, quality check details, and associated payment entries.
 *     tags: [Reports]
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
 *     responses:
 *       200:
 *         description: Purchase entry reports fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/purchase-entry",
    reportsController.getAllPurchaseEntryReports,
);

export default router;