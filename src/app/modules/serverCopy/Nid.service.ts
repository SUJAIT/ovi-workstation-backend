import { TransactionService } from "../transaction/transaction.service"

const NID_API_URL = process.env.NID_API_URL || "https://ovi-workstation-backend.onrender.com/example/exampleApi"

export const ServerCopyService = {

  // ── Search + wallet deduct + history save ─────────────────────
  searchNid: async (userId: string, userRole: string, nid: string, dob: string) => {
    const isFreeAccess = userRole === "admin" || userRole === "super_admin"

    // balance check
    if (!isFreeAccess) {
      const walletInfo = await TransactionService.getWalletInfo(userId)
      if (!walletInfo || walletInfo.wallet.balance < 40) {
        throw new Error("INSUFFICIENT_BALANCE")
      }
    }

    // NID API call
    const response = await fetch(`${NID_API_URL}?nid=${nid}&dob=${dob}`)
    const data = await response.json()

    if (data.status === "not_found" || data.status !== "success") {
      throw new Error("NID_NOT_FOUND")
    }

    // wallet deduct + transaction save (সব info সহ)
    if (!isFreeAccess) {
      await TransactionService.deductBalance(
        userId,
        nid,
        dob,
        data.nameEn || "",   // ইংরেজি নাম
        data.name || ""      // বাংলা নাম
      )
    }

    return data
  },

  // ── শুধু data আনো (PDF এর জন্য — wallet deduct নেই) ──────────
  getNidData: async (nid: string, dob: string) => {
    const response = await fetch(`${NID_API_URL}?nid=${nid}&dob=${dob}`)
    const data = await response.json()
    if (data.status === "not_found" || data.status !== "success") return null
    return data
  },
}