import { Request, Response } from "express"
import { SnidService } from "./snid.service"

const getSnidInfo = async (req: Request, res: Response): Promise<void> => {
  try {

    const { nid, dob, version } = req.body

    if (!nid || !dob) {
      res.status(400).json({
        status: "failed",
        message: "NID and DOB are required"
      })
      return
    }

    const result = await SnidService.getSnidInfoFromApi({
      nid,
      dob
    })

    res.status(200).json({
      status: "success",
      data: result
    })

  } catch (error) {

    res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error
    })

  }
}

export const SnidController = {
  getSnidInfo
}