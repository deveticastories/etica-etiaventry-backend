
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
 *   - name: Purchase Quality Checks
 *     description: Purchase entry quality inspection APIs
 *   - name: Stock
 *     description: Stock listing APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     QualityCheckProductInput:
 *       type: object
 *       required:
 *         - purchaseEntryProduct
 *         - damageQty
 *       properties:
 *         purchaseEntryProduct:
 *           type: string
 *           description: ObjectId of the product subdocument in PurchaseEntry
 *           example: "68f123456789abcdef123457"
 *         damageQty:
 *           type: integer
 *           minimum: 0
 *           description: Quantity of this product that is damaged
 *           example: 2
 *
 *     QualityCheckRequest:
 *       type: object
 *       required:
 *         - purchaseEntry
 *         - products
 *       properties:
 *         purchaseEntry:
 *           type: string
 *           description: Purchase entry ObjectId
 *           example: "68f123456789abcdef123456"
 *         products:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/QualityCheckProductInput'
 *
 *     QualityCheckProduct:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "68f123456789abcdef123457"
 *         purchaseEntryProduct:
 *           type: string
 *           example: "68f123456789abcdef123458"
 *         product:
 *           type: string
 *           example: "68f123456789abcdef123459"
 *         totalQty:
 *           type: number
 *           example: 100
 *         purchaseRate:
 *           type: number
 *           example: 350
 *         sellingPrice:
 *           type: number
 *           nullable: true
 *           example: 499
 *         damageQty:
 *           type: number
 *           example: 5
 *         approvedQty:
 *           type: number
 *           example: 95
 *         availableQtyAfterQC:
 *           type: number
 *           example: 95
 *         payableAfterQC:
 *           type: number
 *           example: 33250
 *
 *     QualityCheckResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Purchase quality check saved successfully
 *         data:
 *           type: object
 *           properties:
 *             qualityCheck:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "68f123456789abcdef123456"
 *                 purchaseEntry:
 *                   type: string
 *                   example: "68f123456789abcdef123457"
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QualityCheckProduct'
 *                 totalApprovedQty:
 *                   type: number
 *                   example: 95
 *                 totalDamagedQty:
 *                   type: number
 *                   example: 5
 *                 availableQtyAfterQC:
 *                   type: number
 *                   example: 95
 *                 payableAfterQC:
 *                   type: number
 *                   example: 33250
 *             stockBatchDetails:
 *               type: array
 *               items:
 *                 type: object
 *
 *     QualityCheckListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Purchase quality checks fetched successfully
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         pagination:
 *           $ref: '#/components/schemas/StockPagination'
 *
 *     StockListItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "68f123456789abcdef123456"
 *         stockId:
 *           type: string
 *           example: "68f123456789abcdef123458"
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
 *         availableQtyAfterQC:
 *           type: number
 *           example: 90
 *         availableStockQuantityAfterBill:
 *           type: number
 *           example: 65
 *         minimumStockAlertQuantity:
 *           type: number
 *           example: 100
 *         shortFall:
 *           type: number
 *           example: -35
 *         purchaseRate:
 *           type: number
 *           minimum: 0
 *           example: 350
 *         sellingPrice:
 *           type: number
 *           minimum: 0
 *           nullable: true
 *           example: 499
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
 *
 *     StockListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Stock records fetched successfully
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StockListItem'
 *         pagination:
 *           $ref: '#/components/schemas/StockPagination'
 *
 *     ApiError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Invalid request
 */

/**
 * @swagger
 * /api/purchase-quality-checks:
 *   post:
 *     summary: Create or update a purchase quality check
 *     description: Performs quality inspection for selected purchase entry products. Calculates approved quantities, damaged quantities, available quantities, and payable amounts. Creates stock batches for approved quantities and adjusts aggregate stock.
 *     tags: [Purchase Quality Checks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QualityCheckRequest'
 *           example:
 *             purchaseEntry: "68f123456789abcdef123456"
 *             products:
 *               - purchaseEntryProduct: "68f123456789abcdef123457"
 *                 damageQty: 2
 *               - purchaseEntryProduct: "68f123456789abcdef123459"
 *                 damageQty: 1
 *     responses:
 *       200:
 *         description: Purchase quality check saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QualityCheckResponse'
 *       400:
 *         description: Invalid input or quality check already completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Purchase entry or product not found
 *       500:
 *         description: Internal server error
 */
router.post("/", verifyToken, createOrUpdateQualityCheckController);

/**
 * @swagger
 * /api/purchase-quality-checks:
 *   get:
 *     summary: Get all purchase quality checks
 *     description: Retrieves all purchase quality check records.
 *     tags: [Purchase Quality Checks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Purchase quality checks fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QualityCheckListResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", verifyToken, getAllQualityChecksController);
/**
 * @swagger
 * components:
 *   schemas:
 *     StockListItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         stockId:
 *           type: string
 *         purchaseEntryId:
 *           type: string
 *         invoiceNo:
 *           type: string
 *           example: PUR-0001
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *         product:
 *           type: string
 *         productName:
 *           type: string
 *           example: Cotton Kurti
 *         vendor:
 *           type: string
 *           example: Sree Textiles
 *         purchaseQty:
 *           type: number
 *           example: 100
 *         purchaseQtyAfterQC:
 *           type: number
 *           example: 95
 *         damageQty:
 *           type: number
 *           example: 5
 *         availableQtyAfterQC:
 *           type: number
 *           example: 95
 *         availableStockQuantityAfterBill:
 *           type: number
 *           example: 65
 *         minimumStockAlertQuantity:
 *           type: number
 *           example: 100
 *         shortFall:
 *           type: number
 *           example: -35
 *         purchaseRate:
 *           type: number
 *           example: 350
 *         sellingPrice:
 *           type: number
 *           nullable: true
 *           example: 499
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
 *
 *     StockListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Stock records fetched successfully
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StockListItem'
 *         pagination:
 *           $ref: '#/components/schemas/StockPagination'
 *
 * paths:
 *   /api/purchase-quality-checks/stock:
 *     get:
 *       summary: Get all stock records with pagination and search
 *       description: Returns QC-completed purchase products with invoice details, vendor, approved quantity, current stock quantity, purchase rate, selling price, calculated shortfall, and stock value.
 *       tags:
 *         - Stock
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             minimum: 1
 *             default: 1
 *           description: Page number
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 100
 *             default: 10
 *           description: Number of records per page
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *           description: Search by product name, invoice number, or vendor name
 *       responses:
 *         200:
 *           description: Stock records fetched successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StockListResponse'
 *               example:
 *                 success: true
 *                 message: Stock records fetched successfully
 *                 data:
 *                   - _id: "68f123456789abcdef123456"
 *                     stockId: "68f123456789abcdef123458"
 *                     purchaseEntryId: "68f123456789abcdef123450"
 *                     invoiceNo: "PUR-0001"
 *                     purchaseDate: "2026-10-03T00:00:00.000Z"
 *                     product: "68f123456789abcdef123451"
 *                     productName: "Cotton Kurti"
 *                     vendor: "Sree Textiles"
 *                     purchaseQty: 100
 *                     purchaseQtyAfterQC: 95
 *                     damageQty: 5
 *                     availableQtyAfterQC: 95
 *                     availableStockQuantityAfterBill: 65
 *                     minimumStockAlertQuantity: 100
 *                     shortFall: -35
 *                     purchaseRate: 350
 *                     sellingPrice: 499
 *                     stockValue: 22750
 *                 pagination:
 *                   currentPage: 1
 *                   limit: 10
 *                   totalRecords: 25
 *                   totalPages: 3
 *                   hasPreviousPage: false
 *                   hasNextPage: true
 *         400:
 *           description: Invalid pagination parameters
 *         401:
 *           description: Unauthorized
 *         500:
 *           description: Failed to fetch stock
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
 *         example: "68f123456789abcdef123456"
 *     responses:
 *       200:
 *         description: Purchase quality check fetched successfully
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
 *                   example: Purchase quality check fetched successfully
 *                 data:
 *                   type: object
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
