import { Request, Response } from "express"
import { createBkashPayment, executeBkashPayment, refundBkashPayment } from "./bkash.service"
import { Payment } from "./payment.model"
import { TransactionService } from "../transaction/transaction.service"
import mongoose from "mongoose"

const FRONTEND_URL = process.env.FRONTEND_URL || "https://ovi-client-avzas0je8-md-sujait-ullahs-projects.vercel.app"

// ── Payment Create ────────────────────────────────────────────────
const createPayment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    const { amount } = req.body

    if (!amount || amount < 10) {
      res.status(400).json({ success: false, message: "সর্বনিম্ন ১০ টাকা recharge করুন" })
      return
    }

    const bkashData = await createBkashPayment(Number(amount), user._id.toString())

    await Payment.create({
      userId: user._id,
      paymentID: bkashData.paymentID,
      amount: Number(amount),
      status: "pending",
    })

    res.status(200).json({
      success: true,
      paymentID: bkashData.paymentID,
      bkashURL: bkashData.bkashURL,
    })

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Payment শুরু করা যায়নি" })
  }
}

// ── Mock Callback — JSON return করে (redirect নেই) ────────────────
const mockCallback = async (req: Request, res: Response) => {
  const session = await mongoose.startSession()

  try {
    const { paymentID, status } = req.query as { paymentID: string; status: string }

    if (status === "cancel") {
      await Payment.findOneAndUpdate({ paymentID }, { status: "cancelled" })
      res.status(200).json({ success: false, reason: "cancel" })
      return
    }

    const payment = await Payment.findOne({ paymentID })
    if (!payment) {
      res.status(404).json({ success: false, reason: "not_found" })
      return
    }

    if (payment.status === "success") {
      res.status(200).json({
        success: true,
        amount: payment.amount,
        trxID: payment.trxID,
      })
      return
    }

    let trxID = ""

    await session.withTransaction(async () => {
      const result = await executeBkashPayment(paymentID)
      trxID = result.trxID

      await Payment.findOneAndUpdate(
        { paymentID },
        { status: "success", trxID: result.trxID },
        { session }
      )

      await TransactionService.rechargeWalletWithSession(
        payment.userId.toString(),
        result.amount,
        `bKash Recharge — TrxID: ${result.trxID}`,
        session
      )
    })

    res.status(200).json({
      success: true,
      amount: payment.amount,
      trxID,
    })

  } catch (error: any) {
    console.error("Mock callback error:", error)

    try {
      const { paymentID } = req.query as { paymentID: string }
      const payment = await Payment.findOne({ paymentID })
      if (payment) {
        await Payment.findOneAndUpdate({ paymentID }, { status: "failed" })
      }
    } catch {}

    res.status(500).json({ success: false, reason: "system_error" })

  } finally {
    await session.endSession()
  }
}

// ── Real Callback — bKash redirect (real mode এর জন্য) ───────────
const paymentCallback = async (req: Request, res: Response) => {
  const session = await mongoose.startSession()

  try {
    const { paymentID, status } = req.query as { paymentID: string; status: string }

    if (status === "cancel" || status === "failure") {
      await Payment.findOneAndUpdate(
        { paymentID },
        { status: status === "cancel" ? "cancelled" : "failed" }
      )
      res.redirect(`${FRONTEND_URL}/payment/failed?reason=${status}`)
      return
    }

    const payment = await Payment.findOne({ paymentID })
    if (!payment) {
      res.redirect(`${FRONTEND_URL}/payment/failed?reason=not_found`)
      return
    }

    if (payment.status === "success") {
      res.redirect(`${FRONTEND_URL}/payment/success?amount=${payment.amount}&trxID=${payment.trxID}`)
      return
    }

    let trxID = ""

    await session.withTransaction(async () => {
      const result = await executeBkashPayment(paymentID)
      trxID = result.trxID

      await Payment.findOneAndUpdate(
        { paymentID },
        { status: "success", trxID: result.trxID },
        { session }
      )

      await TransactionService.rechargeWalletWithSession(
        payment.userId.toString(),
        result.amount,
        `bKash Recharge — TrxID: ${result.trxID}`,
        session
      )
    })

    res.redirect(`${FRONTEND_URL}/payment/success?amount=${payment.amount}&trxID=${trxID}`)

  } catch (error: any) {
    console.error("Payment callback error:", error)

    try {
      const { paymentID } = req.query as { paymentID: string }
      const payment = await Payment.findOne({ paymentID })

      if (payment?.trxID) {
        await refundBkashPayment(payment.trxID, payment.amount)
        await Payment.findOneAndUpdate({ paymentID }, { status: "refunded" })
      } else if (payment) {
        await Payment.findOneAndUpdate({ paymentID }, { status: "failed" })
      }
    } catch (refundErr) {
      console.error("Refund failed:", refundErr)
    }

    res.redirect(`${FRONTEND_URL}/payment/failed?reason=system_error`)

  } finally {
    await session.endSession()
  }
}

// ── Payment History ───────────────────────────────────────────────
const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    const payments = await Payment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20)

    res.status(200).json({ success: true, data: payments })
  } catch {
    res.status(500).json({ success: false, message: "History আনা যায়নি" })
  }
}

export const PaymentController = { createPayment, paymentCallback, mockCallback, getPaymentHistory }