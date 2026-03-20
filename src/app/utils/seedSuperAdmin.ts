// 


import { User } from "../modules/user/user.model";

export const seedSuperAdmin = async () => {
  const isExist = await User.findOne({ role: "super_admin" });

  if (!isExist) {
    await User.findOneAndUpdate(
      { firebaseUid: "bSoK842MfnhU3yMa1Vye9dOJP7w1" },
      {
        $set: {
          email: "mdsujaitullah@gmail.com",
          role: "super_admin",
        },
        $setOnInsert: {
          firebaseUid: "bSoK842MfnhU3yMa1Vye9dOJP7w1",
        },
      },
      { upsert: true, new: true }
    );
    console.log("Super Admin Created/Updated");
  }
};