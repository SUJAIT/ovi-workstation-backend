import express from "express"
 
import verifyFirebaseToken from "../../middleware/auth"
import { ServerCopyController } from "./Nid.controller"

const router = express.Router()

// GET /server-copy/search?nid=xxx&dob=xxx
router.get("/search", verifyFirebaseToken, ServerCopyController.searchNid)

// GET /server-copy/pdf?nid=xxx&dob=xxx
router.get("/pdf", verifyFirebaseToken, ServerCopyController.downloadPdf)

export const ServerCopyRoute = router