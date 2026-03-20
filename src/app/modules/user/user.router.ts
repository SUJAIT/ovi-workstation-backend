import express from "express"
import { UserController } from "./user.controller"
import verifyFirebaseToken from "../../middleware/auth"
import { authorize } from "../../middleware/authorized"

const router = express.Router()

// ── Public ────────────────────────────────────────────────────────
router.post("/create-user", UserController.createUser)

// ── Authenticated ─────────────────────────────────────────────────
router.get("/profile", verifyFirebaseToken, UserController.getProfile)

// ── First time super_admin setup ──────────────────────────────────
// শুধু তখনই কাজ করে যখন কোনো super_admin নেই
router.post("/setup-super-admin", verifyFirebaseToken, UserController.setupSuperAdmin)

// ── Admin only ────────────────────────────────────────────────────
router.get(
  "/all",
  verifyFirebaseToken,
  authorize("admin", "super_admin"),
  UserController.getAllUsers
)

router.patch(
  "/:userId/role",
  verifyFirebaseToken,
  authorize("super_admin"),
  UserController.updateRole
)

router.post(
  "/recharge",
  verifyFirebaseToken,
  authorize("admin", "super_admin"),
  UserController.rechargeUserWallet
)
router.patch("/role", verifyFirebaseToken, authorize("super_admin"), UserController.updateRole)

export const UserRoute = router