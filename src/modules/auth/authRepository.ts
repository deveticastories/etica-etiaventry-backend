import User, { UserDocument } from "../../models/userModel";

export const findByEmail = async (
  email: string,
): Promise<UserDocument | null> => {
  return User.findOne({
    email: email.trim().toLowerCase(),
    isDeleted: false,
  })
    .select("+password")
    .populate("role")
    .exec();
};