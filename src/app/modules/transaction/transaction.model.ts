import { Schema, model } from "mongoose"
import { ITransaction } from "./transaction.interface"

const transactionSchema = new Schema<ITransaction>(
  {
    userId:       { type: Schema.Types.ObjectId, ref: "User", required: true },
    type:         { type: String, enum: ["credit", "debit"], required: true },
    amount:       { type: Number, required: true },
    service:      { type: String, enum: ["server-copy", "recharge"], required: true },
    nid:          { type: String },
    dob:          { type: String },
    nameEn:       { type: String },
    name:         { type: String },
    balanceBefore:{ type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    status:       { type: String, enum: ["success", "failed"], default: "success" },
    note:         { type: String },
  },
  { timestamps: true }
)

export const Transaction = model<ITransaction>("Transaction", transactionSchema)