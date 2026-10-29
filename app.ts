import express, { type Application } from "express";
import cors from "cors";
import authRoutes from "./src/modules/auth/authRoutes";
import userRoutes from "./src/modules/user/userRoutes"
import roleRoutes from "./src/modules/role/roleRoutes";
import vendorRoutes from "./src/modules/vendor/vendorRoutes";
import storeRoutes from "./src/modules/store/storeRoutes";
import customerRoutes from "./src/modules/customer/customerRoutes";
import purchaseEntryRoutes from "./src/modules/purchaseEntry/purchaseEntryRoutes";
import purchaseQualityCheckRoutes from "./src/modules/purchaseQualityCheck/purchaseQualityCheckRoutes";
import dailyExpenseRoutes from "./src/modules/dailyExpense/dailyExpenseRoutes";
import billingRoutes from "./src/modules/billing/billingRoutes"
import salesReturnRoutes from "./src/modules/salesReturn/salesReturnRoutes";
import paymentEntriesRoutes from "./src/modules/paymentEntry/paymentEntryRoutes"
import receiptEntryRoutes from "./src/modules/receiptEntry/receiptEntryRoutes";
import reportsRoutes from "./src/modules/reports/reportsRoutes" 
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/config/swagger";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/customers", customerRoutes)
app.use("/api/purchase-entries", purchaseEntryRoutes);
app.use("/api/purchase-quality-checks", purchaseQualityCheckRoutes);
app.use("/api/daily-expenses", dailyExpenseRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/sales-returns", salesReturnRoutes);
app.use("/api/payment-entries", paymentEntriesRoutes)
app.use("/api/receipt-entries", receiptEntryRoutes);
app.use("/api/reports", reportsRoutes);
export default app;