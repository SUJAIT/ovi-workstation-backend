import express from "express"
import { TransactionController } from "./transaction.controller"
import verifyFirebaseToken from "../../middleware/auth"
import { authorize } from "../../middleware/authorized"

const router = express.Router()

router.get("/wallet",   verifyFirebaseToken, TransactionController.getWalletInfo)
router.get("/my",       verifyFirebaseToken, TransactionController.getMyTransactions)
router.get("/all",      verifyFirebaseToken, authorize("admin", "super_admin"), TransactionController.getAllTransactions)
router.post("/recharge",verifyFirebaseToken, authorize("admin", "super_admin"), TransactionController.rechargeWallet)

export const TransactionRoute = router