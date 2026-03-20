import { Request, Response } from "express"
import { UserService } from "./user.services"
import { User } from "./user.model"

// ── Profile ───────────────────────────────────────────────────────
const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    const result = await UserService.getUserByFirebaseUid(user.firebaseUid)
    res.status(200).json({ success: true, data: result })
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch profile" })
  }
}

// ── Create user ───────────────────────────────────────────────────
const createUser = async (req: Request, res: Response) => {
  try {
    const result = await UserService.createUser(req.body)
    res.status(200).json({ success: true, message: "User created", data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: "User creation failed" })
  }
}

// ── Get all users (admin only) ────────────────────────────────────
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select("-__v")
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, data: users })
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch users" })
  }
}

// ── Update user role (super_admin only) ───────────────────────────
const updateRole = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body  // ← params থেকে body তে change
    const requester = (req as any).user

    const validRoles = ["user", "admin"]
    if (!validRoles.includes(role)) {
      res.status(400).json({ success: false, message: "Invalid role" })
      return
    }

    const targetUser = await User.findById(userId)
    if (!targetUser) {
      res.status(404).json({ success: false, message: "User not found" })
      return
    }

    // super_admin protect
    if (targetUser.role === "super_admin") {
      res.status(403).json({ success: false, message: "Cannot change super_admin role" })
      return
    }

    // নিজের role change করা যাবে না
    if (requester._id.toString() === userId) {
      res.status(403).json({ success: false, message: "Cannot change your own role" })
      return
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-__v")

    res.status(200).json({
      success: true,
      message: `Role updated to ${role}`,
      data: updated,
    })
  } catch {
    res.status(500).json({ success: false, message: "Role update failed" })
  }
}

// ── Make self super_admin (first time setup only) ─────────────────
// শুধু তখনই কাজ করবে যখন DB তে কোনো super_admin নেই
const setupSuperAdmin = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user

    // DB তে কোনো super_admin আছে কিনা check
    const existingSuperAdmin = await User.findOne({ role: "super_admin" })

    if (existingSuperAdmin) {
      res.status(403).json({
        success: false,
        message: "Super admin already exists. Contact existing super admin.",
      })
      return
    }

    // প্রথমবার — নিজেকে super_admin বানাও
    const updated = await User.findByIdAndUpdate(
      user._id,
      { role: "super_admin" },
      { new: true }
    ).select("-__v")

    res.status(200).json({
      success: true,
      message: "✅ You are now super_admin!",
      data: updated,
    })
  } catch {
    res.status(500).json({ success: false, message: "Setup failed" })
  }
}

// ── Recharge user wallet (admin only) ────────────────────────────
const rechargeUserWallet = async (req: Request, res: Response) => {
  try {
    const { userId, amount, note } = req.body

    if (!userId || !amount || amount <= 0) {
      res.status(400).json({ success: false, message: "userId and valid amount required" })
      return
    }

    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" })
      return
    }

    const balanceBefore = user.wallet?.balance || 0
    const balanceAfter = balanceBefore + amount

    await User.findByIdAndUpdate(userId, {
      $inc: {
        "wallet.balance": amount,
        "wallet.totalRecharge": amount,
      },
    })

    res.status(200).json({
      success: true,
      message: `${amount} টাকা added to ${user.name || user.email}`,
      data: { balanceBefore, balanceAfter, amount },
    })
  } catch {
    res.status(500).json({ success: false, message: "Recharge failed" })
  }
};



export const UserController = {
  getProfile,
  createUser,
  getAllUsers,
  updateRole,
  setupSuperAdmin,
  rechargeUserWallet,

}