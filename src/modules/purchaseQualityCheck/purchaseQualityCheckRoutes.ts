import { Router } from "express";
import verifyToken from "../../middleware/verifyToken";
import {
    createOrUpdateQualityCheckController,
    getAllQualityChecksController,
    getQualityCheckByIdController,
    getAllStockController,
} from "./purchaseQualityCheckController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Purchase Quality Checks
 *   description: Purchase entry quality inspection APIs
 */

/**
 * @swagger
 * tags:
 *   name: Stock
 *   description: Stock listing APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StockListItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "68f123456789abcdef123456"
 *         invoiceNo:
 *           type: string
 *           example: "PUR-0001"
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *           example: "2026-10-03T00:00:00.000Z"
 *         productName:
 *           type: string
 *           example: "Cotton Kurti"
 *         vendor:
 *           type: string
 *           example: "Sree Textiles"
 *         purchaseQtyAfterQC:
 *           type: number
 *           example: 95
 *         availableQty:
 *           type: number
 *           example: 65
 *         purchaseRate:
 *           type: number
 *           example: 350
 *         stockValue:
 *           type: number
 *           example: 22750
 *
 *     StockPagination:
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
 * /api/purchase-quality-checks:
 *   post:
 *     summary: Create or update a purchase quality check
 *     description: Calculates approved quantities, damaged quantities, available quantities, and payable amounts using purchase entry data and product IDs.
 *     tags: [Purchase Quality Checks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - purchaseEntry
 *               - products
 *             properties:
 *               purchaseEntry:
 *                 type: string
 *                 description: Purchase entry ObjectId
 *                 example: "68f123456789abcdef123456"
 *               products:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - purchaseEntryProduct
 *                     - damageQty
 *                   properties:
 *                     purchaseEntryProduct:
 *                       type: string
 *                       description: ObjectId of the product subdocument in PurchaseEntry
 *                       example: "68f123456789abcdef123457"
 *                     damageQty:
 *                       type: integer
 *                       minimum: 0
 *                       description: Quantity of this product that is damaged
 *                       example: 2
 *     responses:
 *       200:
 *         description: Purchase quality check saved successfully
 *       400:
 *         description: Invalid input, invalid product ID, or quality check already completed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Purchase entry not found
 *       500:
 *         description: Internal server error
 */
router.post("/", verifyToken, createOrUpdateQualityCheckController);

/**
 * @swagger
 * /api/purchase-quality-checks:
 *   get:
 *     summary: Get all purchase quality checks
 *     tags: [Purchase Quality Checks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Purchase quality checks fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", verifyToken, getAllQualityChecksController);

/**
 * @swagger
 * /api/purchase-quality-checks/stock:
 *   get:
 *     summary: Get all stock records with pagination and search
 *     description: Returns quality-checked products with invoice number, purchase date, vendor, approved quantity, available quantity, purchase rate, and stock value.
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name, invoice number, or vendor name
 *     responses:
 *       200:
 *         description: Stock records fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StockListItem'
 *                 pagination:
 *                   $ref: '#/components/schemas/StockPagination'
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch stock
 */
router.get("/stock", verifyToken, getAllStockController);

/**
 * @swagger
 * /api/purchase-quality-checks/{id}:
 *   get:
 *     summary: Get a purchase quality check by ID
 *     tags: [Purchase Quality Checks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase quality check ObjectId
 *     responses:
 *       200:
 *         description: Purchase quality check fetched successfully
 *       400:
 *         description: Invalid quality check ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Purchase quality check not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", verifyToken, getQualityCheckByIdController);

export default router;
