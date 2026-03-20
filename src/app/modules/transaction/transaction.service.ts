import { User } from "../user/user.model"
import { Transaction } from "./transaction.model"
import mongoose from "mongoose"

const SERVICE_CHARGE = 40

// ── নিজের transactions ───────────────────────────────────────────
const getMyTransactions = async (userId: string) => {
  return await Transaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(100)
}

// ── সব transactions (admin) ──────────────────────────────────────
const getAllTransactions = async () => {
  return await Transaction.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .limit(200)
}

// ── Wallet deduct — সব NID info সহ save করে ──────────────────────
const deductBalance = async (
  userId: string,
  nid: string,
  dob: string,
  nameEn?: string,
  name?: string
) => {
  const user = await User.findById(userId)
  if (!user) throw new Error("User not found")

  // admin/super_admin free
  if (user.role === "admin" || user.role === "super_admin") {
    return { success: true, freeAccess: true }
  }

  if (user.wallet.balance < SERVICE_CHARGE) {
    throw new Error("Insufficient balance")
  }

  const balanceBefore = user.wallet.balance
  const balanceAfter = balanceBefore - SERVICE_CHARGE

  await User.findByIdAndUpdate(userId, {
    $inc: {
      "wallet.balance": -SERVICE_CHARGE,
      "wallet.totalSpent": SERVICE_CHARGE,
    },
  })

  // সব info সহ transaction save
  await Transaction.create({
    userId,
    type: "debit",
    amount: SERVICE_CHARGE,
    service: "server-copy",
    nid,
    dob,
    nameEn: nameEn || "",
    name: name || "",
    balanceBefore,
    balanceAfter,
    status: "success",
  })

  return { success: true, deducted: SERVICE_CHARGE, balanceAfter }
}

// ── Wallet recharge ───────────────────────────────────────────────
const rechargeWallet = async (
  targetUserId: string,
  amount: number,
  note?: string
) => {
  if (amount <= 0) throw new Error("Amount must be greater than 0")

  const user = await User.findById(targetUserId)
  if (!user) throw new Error("User not found")
  if (user.role !== "user") throw new Error("Can only recharge user accounts")

  const balanceBefore = user.wallet.balance
  const balanceAfter = balanceBefore + amount

  await User.findByIdAndUpdate(targetUserId, {
    $inc: {
      "wallet.balance": amount,
      "wallet.totalRecharge": amount,
    },
  })

  await Transaction.create({
    userId: targetUserId,
    type: "credit",
    amount,
    service: "recharge",
    balanceBefore,
    balanceAfter,
    status: "success",
    note,
  })

  return { success: true, recharged: amount, balanceAfter }
}

// ── Wallet recharge WITH Session (bKash rollback) ─────────────────
const rechargeWalletWithSession = async (
  targetUserId: string,
  amount: number,
  note: string,
  session: mongoose.ClientSession
) => {
  if (amount <= 0) throw new Error("Amount must be greater than 0")

  const users = await User.find({ _id: targetUserId }).session(session)
  const user = users[0]
  if (!user) throw new Error("User not found")

  const balanceBefore = user.wallet.balance
  const balanceAfter = balanceBefore + amount

  await User.findByIdAndUpdate(
    targetUserId,
    { $inc: { "wallet.balance": amount, "wallet.totalRecharge": amount } },
    { session }
  )

  await Transaction.create(
    [{
      userId: targetUserId,
      type: "credit",
      amount,
      service: "recharge",
      balanceBefore,
      balanceAfter,
      status: "success",
      note,
    }],
    { session }
  )

  return { success: true, recharged: amount, balanceAfter }
}

// ── Wallet info ───────────────────────────────────────────────────
const getWalletInfo = async (userId: string) => {
  return await User.findById(userId).select("wallet name email role")
}

export const TransactionService = {
  getMyTransactions,
  getAllTransactions,
  deductBalance,
  rechargeWallet,
  rechargeWalletWithSession,
  getWalletInfo,
}