import { Request, Response } from "express"
 
import { generateNidPdf } from "./pdfGenerator"
import { ServerCopyService } from "./Nid.service";

// ── NID Search ────────────────────────────────────────────────────
const searchNid = async (req: Request, res: Response) => {
  try {
    const { nid, dob } = req.query as { nid: string; dob: string }
    const user = (req as any).user

    if (!nid || !dob) {
      res.status(400).json({ success: false, message: "NID এবং জন্ম তারিখ দিন" })
      return
    }
    if (nid.length !== 10 && nid.length !== 17) {
      res.status(400).json({ success: false, message: "NID অবশ্যই ১০ বা ১৭ সংখ্যার হতে হবে" })
      return
    }

    const result = await ServerCopyService.searchNid(
      user._id.toString(),
      user.role,
      nid,
      dob
    )

    res.status(200).json({ success: true, data: result })

  } catch (error: any) {
    if (error.message === "INSUFFICIENT_BALANCE") {
      res.status(402).json({
        success: false,
        message: "পর্যাপ্ত ব্যালেন্স নেই। রিচার্জ করুন।",
        code: "INSUFFICIENT_BALANCE",
      })
      return
    }
    if (error.message === "NID_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "তথ্য পাওয়া যায়নি। NID বা তারিখ সঠিক নয়।",
        code: "NID_NOT_FOUND",
      })
      return
    }
    res.status(500).json({ success: false, message: "সার্ভার এরর।" })
  }
}

// ── PDF Download (wallet deduct নেই) ─────────────────────────────
const downloadPdf = async (req: Request, res: Response) => {
  try {
    const { nid, dob } = req.query as { nid: string; dob: string }

    if (!nid || !dob) {
      res.status(400).json({ success: false, message: "NID এবং DOB দিন" })
      return
    }

    const data = await ServerCopyService.getNidData(nid, dob)

    if (!data) {
      res.status(404).json({ success: false, message: "তথ্য পাওয়া যায়নি।" })
      return
    }

    const pdfBuffer = await generateNidPdf(data)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="NID_${nid}.pdf"`)
    res.setHeader("Content-Length", pdfBuffer.length)
    res.end(pdfBuffer)

  } catch (error: any) {
    console.error("PDF error:", error)
    res.status(500).json({ success: false, message: "PDF তৈরিতে সমস্যা।" })
  }
}

export const ServerCopyController = { searchNid, downloadPdf }