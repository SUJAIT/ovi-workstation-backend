// src/app/modules/payment/payment.model.ts
import { Schema, model } from "mongoose"

export interface IPayment {
  userId: Schema.Types.ObjectId
  paymentID: string
  trxID?: string
  amount: number
  status: "pending" | "success" | "failed" | "cancelled" | "refunded"
  refundReason?: string
  createdAt?: Date
  updatedAt?: Date
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    paymentID: { type: String, required: true, unique: true },
    trxID: { type: String },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    refundReason: { type: String },
  },
  { timestamps: true }
)

export const Payment = model<IPayment>("Payment", paymentSchema)