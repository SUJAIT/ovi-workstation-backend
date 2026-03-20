import express from "express"
import { SnidController } from "./snid.controller"

const router = express.Router()

// NID info API
router.post("/info", SnidController.getSnidInfo)

export const SnidRoute = router