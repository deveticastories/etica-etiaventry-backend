import bcrypt from "bcrypt";
import User from "../models/userModel";
import RoleModel from "../models/roleModel";

export const seedSuperAdmin = async (): Promise<void> => {
  const email = process.env.SUPER_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required",
    );
  }

  const adminRole = await RoleModel.findOne({
    roleName: "Admin",
    isDeleted: false,
  });

  if (!adminRole) {
    throw new Error("Admin role not found. Please seed roles first.");
  }

  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    staffName: "Super Admin",
    mobileNumber: "9876543210",
    employeeId: "EMP001",
    email,
    password: passwordHash,
    role: adminRole._id,
  });

  console.log(`Admin created: ${email}`);
};