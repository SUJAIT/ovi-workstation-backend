import express from "express"
import { SnidController } from "./example.snid"

const router = express.Router()

router.get(
  '/exampleApi',
  SnidController.exampleApi
)

export const ExampleRoute = router