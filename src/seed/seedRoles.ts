
import RoleModel from "../models/roleModel";

export const seedRoles = async (): Promise<void> => {
    const roleName = "Admin";

    const existingRole = await RoleModel.findOne({
        roleName,
        isDeleted: false,
    });

    if (existingRole) {
        console.log(`Role already exists: ${roleName}`);
        return;
    }

    await RoleModel.create({
        roleName,
        modules: [
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
    });

    console.log(`Role created: ${roleName}`);
};
