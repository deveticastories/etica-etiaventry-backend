
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Etica Inventory API",
      version: "1.0.0",
      description: "API documentation for Etica Inventory Management System",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Something went wrong" },
          },
        },

        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "superadmin@gmail.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Superadmin@123",
            },
          },
        },

        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Login successful" },
            data: {
              type: "object",
              properties: {
                token: { type: "string", example: "jwt-token" },
                user: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },

        CreateUser: {
          type: "object",
          required: [
            "staffName",
            "mobileNumber",
            "employeeId",
            "email",
            "password",
            "role",
          ],
          properties: {
            staffName: { type: "string", example: "John Doe" },
            mobileNumber: { type: "string", example: "9876543210" },
            employeeId: { type: "string", example: "EMP001" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Password@123",
            },
            role: {
              type: "string",
              example: "671a12345678901234567890",
            },
          },
        },

        UpdateUser: {
          type: "object",
          properties: {
            staffName: { type: "string", example: "John Doe" },
            mobileNumber: { type: "string", example: "9876543210" },
            employeeId: { type: "string", example: "EMP001" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Password@123",
            },
            role: {
              type: "string",
              example: "671a12345678901234567890",
            },
          },
        },

        UpdateUserStatus: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "boolean", example: true },
          },
        },

        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "671a12345678901234567890",
            },
            staffName: { type: "string", example: "John Doe" },
            mobileNumber: { type: "string", example: "9876543210" },
            employeeId: { type: "string", example: "EMP001" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            role: {
              oneOf: [
                { type: "string" },
                { $ref: "#/components/schemas/Role" },
              ],
            },
            status: { type: "boolean", example: true },
            isDeleted: { type: "boolean", example: false },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        UserResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "User fetched successfully" },
            data: { $ref: "#/components/schemas/User" },
          },
        },

        PaginatedUsersResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Users fetched successfully" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/User" },
            },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        },

        CreateRole: {
          type: "object",
          required: ["roleName", "modules"],
          properties: {
            roleName: { type: "string", example: "Store Manager" },
            modules: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "Dashboard",
                  "Staff",
                  "Roles",
                  "Vendors",
                  "Store",
                  "Customer Master",
                  "Item Master",
                  "Quality Check",
                  "Purchase Data",
                  "Store Stock",
                  "Billing",
                  "Sales Returns",
                  "Daily Expenses",
                  "Payment Entry",
                  "Receipt Entry",
                  "Reports",
                ],
              },
              example: ["Dashboard", "Vendors", "Store Stock"],
            },
          },
        },

        UpdateRole: {
          type: "object",
          properties: {
            roleName: { type: "string", example: "Store Manager" },
            modules: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "Dashboard",
                  "Staff",
                  "Roles",
                  "Vendors",
                  "Store",
                  "Customer Master",
                  "Item Master",
                  "Quality Check",
                  "Purchase Data",
                  "Store Stock",
                  "Billing",
                  "Sales Returns",
                  "Daily Expenses",
                  "Payment Entry",
                  "Receipt Entry",
                  "Reports",
                ],
              },
              example: ["Dashboard", "Vendors"],
            },
          },
        },

        UpdateRoleStatus: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "boolean", example: true },
          },
        },

        Role: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "671a12345678901234567890",
            },
            roleName: { type: "string", example: "Store Manager" },
            modules: {
              type: "array",
              items: { type: "string" },
              example: ["Dashboard", "Vendors"],
            },
            status: { type: "boolean", example: true },
            isDeleted: { type: "boolean", example: false },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        RoleResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Role fetched successfully" },
            data: { $ref: "#/components/schemas/Role" },
          },
        },

        PaginatedRolesResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Roles fetched successfully" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Role" },
            },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        },

        CreateVendor: {
          type: "object",
          required: [
            "vendorName",
            "contactNo",
            "bankName",
            "accountNo",
            "ifsc",
          ],
          properties: {
            vendorName: {
              type: "string",
              example: "ABC Suppliers",
            },
            contactNo: {
              type: "string",
              example: "9876543210",
            },
            bankName: {
              type: "string",
              example: "State Bank of India",
            },
            accountNo: {
              type: "string",
              example: "123456789012",
            },
            ifsc: {
              type: "string",
              example: "SBIN0001234",
            },
          },
        },

        UpdateVendor: {
          type: "object",
          properties: {
            vendorName: {
              type: "string",
              example: "ABC Suppliers",
            },
            contactNo: {
              type: "string",
              example: "9876543210",
            },
            bankName: {
              type: "string",
              example: "State Bank of India",
            },
            accountNo: {
              type: "string",
              example: "123456789012",
            },
            ifsc: {
              type: "string",
              example: "SBIN0001234",
            },
          },
        },

        Vendor: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "671a12345678901234567890",
            },
            vendorName: {
              type: "string",
              example: "ABC Suppliers",
            },
            contactNo: {
              type: "string",
              example: "9876543210",
            },
            bankName: {
              type: "string",
              example: "State Bank of India",
            },
            accountNo: {
              type: "string",
              example: "123456789012",
            },
            ifsc: {
              type: "string",
              example: "SBIN0001234",
            },
            status: {
              type: "boolean",
              example: true,
            },
            isDeleted: {
              type: "boolean",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        VendorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Vendor fetched successfully",
            },
            data: { $ref: "#/components/schemas/Vendor" },
          },
        },

        PaginatedVendorsResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Vendors fetched successfully",
            },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Vendor" },
            },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        },

        Pagination: {
          type: "object",
          properties: {
            currentPage: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            totalRecords: { type: "integer", example: 100 },
            totalPages: { type: "integer", example: 10 },
            hasPreviousPage: { type: "boolean", example: false },
            hasNextPage: { type: "boolean", example: true },
          },
        },

        CreateStore: {
          type: "object",
          required: ["name", "location", "contactNumber", "inCharge"],
          properties: {
            name: {
              type: "string",
              example: "Kochi Store",
            },
            location: {
              type: "string",
              enum: ["IND", "UAE"],
              example: "IND",
            },
            contactNumber: {
              type: "string",
              example: "9876543210",
            },
            inCharge: {
              type: "string",
              description: "MongoDB ObjectId of the assigned user",
              example: "671a12345678901234567890",
            },
          },
        },

        UpdateStore: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "Kochi Store",
            },
            location: {
              type: "string",
              enum: ["IND", "UAE"],
              example: "IND",
            },
            contactNumber: {
              type: "string",
              example: "9876543210",
            },
            inCharge: {
              type: "string",
              description: "MongoDB ObjectId of the assigned user",
              example: "671a12345678901234567890",
            },
          },
        },

        Store: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "671a12345678901234567890",
            },
            name: {
              type: "string",
              example: "Kochi Store",
            },
            location: {
              type: "string",
              enum: ["IND", "UAE"],
              example: "IND",
            },
            contactNumber: {
              type: "string",
              example: "9876543210",
            },
            inCharge: {
              oneOf: [
                { type: "string" },
                { $ref: "#/components/schemas/User" },
              ],
            },
            status: {
              type: "boolean",
              example: true,
            },
            isDeleted: {
              type: "boolean",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        StoreResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Store fetched successfully",
            },
            data: {
              $ref: "#/components/schemas/Store",
            },
          },
        },

        PaginatedStoresResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Stores fetched successfully",
            },
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Store",
              },
            },
            pagination: {
              $ref: "#/components/schemas/Pagination",
            },
          },
        },

        CreateCustomer: {
          type: "object",
          required: [
            "name",
            "contactNo",
            "whatsAppNo",
            "address",
            "email",
          ],
          properties: {
            name: {
              type: "string",
              example: "John Smith",
            },
            contactNo: {
              type: "string",
              example: "9876543210",
            },
            whatsAppNo: {
              type: "string",
              example: "919876543210",
            },
            address: {
              type: "string",
              example: "Kochi, Kerala, India",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
          },
        },

        CreatePurchaseEntry: {
          type: "object",
          required: ["purchaseDate", "vendor", "products", "totalIncludingGST"],
          properties: {
            purchaseDate: {
              type: "string",
              format: "date-time",
              example: "2026-10-24T00:00:00.000Z",
            },
            vendor: {
              type: "string",
              description: "MongoDB ObjectId of the vendor",
              example: "671a12345678901234567890",
            },
            products: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["productName", "purchaseQty", "purchaseRate"],
                properties: {
                  productName: { type: "string", example: "Cotton Fabric" },
                  minimumStockAlertQuantity: { type: "number", minimum: 0, default: 0, example: 5 },
                  purchaseQty: { type: "integer", minimum: 1, example: 100 },
                  purchaseRate: { type: "number", minimum: 0, example: 25.5 },
                },
              },
            },
            totalIncludingGST: { type: "number", minimum: 0, example: 2677.5 },
          },
        },

        UpdatePurchaseEntry: {
          type: "object",
          properties: {
            purchaseDate: { type: "string", format: "date-time", example: "2026-10-24T00:00:00.000Z" },
            vendor: { type: "string", example: "671a12345678901234567890" },
            products: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["productName", "purchaseQty", "purchaseRate"],
                properties: {
                  productName: { type: "string", example: "Cotton Fabric" },
                  minimumStockAlertQuantity: { type: "number", minimum: 0, default: 0, example: 5 },
                  purchaseQty: { type: "integer", minimum: 1, example: 100 },
                  purchaseRate: { type: "number", minimum: 0, example: 25.5 },
                },
              },
            },
            totalIncludingGST: { type: "number", minimum: 0, example: 2677.5 },
            qcStatus: { type: "string", enum: ["Pending", "Done"], example: "Pending" },
          },
        },

        PurchaseEntryProduct: {
          type: "object",
          properties: {
            _id: { type: "string", example: "671a12345678901234567891" },
            productName: { type: "string", example: "Cotton Fabric" },
            minimumStockAlertQuantity: { type: "number", example: 5 },
            purchaseQty: { type: "number", example: 100 },
            purchaseRate: { type: "number", example: 25.5 },
            amount: { type: "number", example: 2550 },
          },
        },

        PurchaseEntry: {
          type: "object",
          properties: {
            _id: { type: "string", example: "671a12345678901234567892" },
            invoiceNo: { type: "string", example: "PUR-0001" },
            purchaseDate: { type: "string", format: "date-time" },
            vendor: {
              oneOf: [
                { type: "string" },
                { $ref: "#/components/schemas/Vendor" },
              ],
            },
            products: {
              type: "array",
              items: { $ref: "#/components/schemas/PurchaseEntryProduct" },
            },
            totalProductQty: { type: "number", example: 100 },
            totalAmount: { type: "number", example: 2550 },
            totalIncludingGST: { type: "number", example: 2677.5 },
            qcStatus: { type: "string", enum: ["Pending", "Done"], example: "Pending" },
            status: { type: "boolean", example: true },
            isDeleted: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        PurchaseEntryResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Purchase entry fetched successfully" },
            data: { $ref: "#/components/schemas/PurchaseEntry" },
          },
        },

        PaginatedPurchaseEntriesResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Purchase entries fetched successfully" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/PurchaseEntry" },
            },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        },

       
      },
    },
  },
  apis: ["./src/routes/**/*.ts", "./src/**/*.ts"],
};


const swaggerSpec = swaggerJsdoc(swaggerOptions);

export { swaggerSpec, swaggerUi };