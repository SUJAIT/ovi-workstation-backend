import { User } from "./user.model";
import { IUser } from "./usre.interface";

const createUser = async (payload: Partial<IUser>) => {
  const result = await User.create(payload);
  return result;
};

const getUserByFirebaseUid = async (firebaseUid: string) => {
  const result = await User.findOne({ firebaseUid });
  return result;
};

const updateUserRole = async (id: string, role: string) => {
  const result = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true }
  );
  return result;
};

const createUserIfNotExists = async (firebaseUser: any) => {
  const user = await User.findOneAndUpdate(
    { firebaseUid: firebaseUser.uid },
    {
      $setOnInsert: {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.name || "",
        role: "user",
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
  return user;
};

const getAllUsers = async () => {
  const result = await User.find()
    .select("-__v")
    .sort({ createdAt: -1 });
  return result;
};
const updateRole = async (userId: string, role: string) => {
  return await User.findByIdAndUpdate(userId, { role }, { new: true })
}
 

export const UserService = {
  createUser,
  getUserByFirebaseUid,
  updateUserRole,
  createUserIfNotExists,
  getAllUsers,
  updateRole
};