import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./src/config/db";
import { seedRoles } from "./src/seed/seedRoles";
import { seedSuperAdmin } from "./src/seed/seedSuperAdmin";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    await seedRoles();
    await seedSuperAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

void startServer();