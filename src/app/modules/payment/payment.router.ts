// src/app/modules/payment/payment.router.ts
import express from "express"

import verifyFirebaseToken from "../../middleware/auth"
import { PaymentController } from "./payment.controller"

const router = express.Router()

// Payment শুরু করো (token লাগবে)
router.post("/create", verifyFirebaseToken, PaymentController.createPayment)

// bKash callback — token লাগবে না (bKash redirect করে)
router.get("/callback", PaymentController.paymentCallback)

// Payment history
router.get("/history", verifyFirebaseToken, PaymentController.getPaymentHistory)

export const PaymentRoute = router