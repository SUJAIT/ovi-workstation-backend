import express from "express"
import verifyFirebaseToken from "../../middleware/auth"
import { PaymentController } from "./payment.controller"

const router = express.Router()

// Payment শুরু করো (token লাগবে)
router.post("/create", verifyFirebaseToken, PaymentController.createPayment)

// bKash callback — token লাগবে না (bKash redirect করে)
router.get("/callback", PaymentController.paymentCallback)

// Mock callback — JSON return করে (frontend directly call করে)
router.get("/mock-callback", PaymentController.mockCallback)

// Payment history
router.get("/history", verifyFirebaseToken, PaymentController.getPaymentHistory)

export const PaymentRoute = router