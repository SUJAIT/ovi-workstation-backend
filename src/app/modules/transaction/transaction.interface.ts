import { Types } from "mongoose"

export type TTransactionType = "credit" | "debit"
export type TTransactionStatus = "success" | "failed"
export type TTransactionService = "server-copy" | "recharge"

export interface ITransaction {
  userId: Types.ObjectId
  type: TTransactionType
  amount: number
  service: TTransactionService
  nid?: string
  dob?: string
  nameEn?: string
  name?: string
  balanceBefore: number
  balanceAfter: number
  status: TTransactionStatus
  note?: string
  createdAt?: Date
  updatedAt?: Date
}