import { Request, Response } from "express"
import { TransactionService } from "./transaction.service"

// নিজের wallet info
const getWalletInfo = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    const result = await TransactionService.getWalletInfo(user._id)
    res.status(200).json({ success: true, data: result })
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch wallet" })
  }
}

// নিজের transaction history
const getMyTransactions = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    const result = await TransactionService.getMyTransactions(user._id)
    res.status(200).json({ success: true, data: result })
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch transactions" })
  }
}

// সব transactions (admin)
const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const result = await TransactionService.getAllTransactions()
    res.status(200).json({ success: true, data: result })
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch transactions" })
  }
}

// Admin: wallet recharge
const rechargeWallet = async (req: Request, res: Response) => {
  try {
    const { userId, amount, note } = req.body
    if (!userId || !amount) {
      res.status(400).json({ success: false, message: "userId and amount required" })
      return
    }
    const result = await TransactionService.rechargeWallet(userId, amount, note)
    res.status(200).json({ success: true, message: `${amount} টাকা added`, data: result })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Recharge failed" })
  }
}

export const TransactionController = {
  getWalletInfo,
  getMyTransactions,
  getAllTransactions,
  rechargeWallet,
}