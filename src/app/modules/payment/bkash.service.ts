// 

// mock start
// src/app/modules/payment/bkash.service.ts
// MOCK MODE — real bKash credentials আসলে শুধু BKASH_MODE=real করুন

const BKASH_MODE = process.env.BKASH_MODE || "mock" // "mock" | "sandbox" | "production"

const BKASH_BASE_URL =
  BKASH_MODE === "production"
    ? "https://tokenized.pay.bka.sh/v1.2.0-beta"
    : "https://tokenized.sandbox.bka.sh/v1.2.0-beta"

const BKASH_APP_KEY = process.env.BKASH_APP_KEY || ""
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET || ""
const BKASH_USERNAME = process.env.BKASH_USERNAME || ""
const BKASH_PASSWORD = process.env.BKASH_PASSWORD || ""
const BACKEND_URL = process.env.BACKEND_URL || "https://ovi-workstation-backend.onrender.com"
const FRONTEND_URL = process.env.FRONTEND_URL || "https://ovi-client-avzas0je8-md-sujait-ullahs-projects.vercel.app"

// ── Mock payment store (real DB এর বদলে memory) ───────────────────
const mockPayments = new Map<string, { amount: number; userId: string; status: string; trxID?: string }>()

// ── Token ─────────────────────────────────────────────────────────
async function getToken(): Promise<string> {
  if (BKASH_MODE === "mock") return "mock_token_xyz"

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username: BKASH_USERNAME,
      password: BKASH_PASSWORD,
    },
    body: JSON.stringify({ app_key: BKASH_APP_KEY, app_secret: BKASH_APP_SECRET }),
  })

  const data = await res.json()
  if (!data.id_token) throw new Error("bKash token নেওয়া যায়নি")
  return data.id_token
}

// ── Payment Create ────────────────────────────────────────────────
export async function createBkashPayment(amount: number, userId: string) {
  if (BKASH_MODE === "mock") {
    const paymentID = `MOCK_${Date.now()}_${userId.slice(-6)}`

    // mock store এ save করো
    mockPayments.set(paymentID, { amount, userId, status: "pending" })

    // Mock bKash page URL — আমাদের নিজের page
    const bkashURL = `${FRONTEND_URL}/payment/mock?paymentID=${paymentID}&amount=${amount}`

    return { paymentID, bkashURL, amount }
  }

  // Real bKash
  const token = await getToken()
  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      authorization: token,
      "x-app-key": BKASH_APP_KEY,
    },
    body: JSON.stringify({
      mode: "0011",
      payerReference: userId,
      callbackURL: `${BACKEND_URL}/payment/callback`,
      amount: amount.toString(),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: `INV-${userId}-${Date.now()}`,
    }),
  })

  const data = await res.json()
  if (data.statusCode !== "0000") throw new Error(data.statusMessage)

  return { paymentID: data.paymentID, bkashURL: data.bkashURL, amount }
}

// ── Payment Execute ───────────────────────────────────────────────
export async function executeBkashPayment(paymentID: string) {
  if (BKASH_MODE === "mock") {
    const payment = mockPayments.get(paymentID)
    if (!payment) throw new Error("Payment not found")

    const trxID = `TRX${Date.now()}`
    payment.status = "success"
    payment.trxID = trxID
    mockPayments.set(paymentID, payment)

    return {
      trxID,
      paymentID,
      amount: payment.amount,
      payerReference: payment.userId,
    }
  }

  // Real bKash
  const token = await getToken()
  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      authorization: token,
      "x-app-key": BKASH_APP_KEY,
    },
    body: JSON.stringify({ paymentID }),
  })

  const data = await res.json()
  if (data.statusCode !== "0000" || data.transactionStatus !== "Completed") {
    throw new Error(data.statusMessage)
  }

  return {
    trxID: data.trxID,
    paymentID: data.paymentID,
    amount: parseFloat(data.amount),
    payerReference: data.payerReference,
  }
}

// ── Refund ────────────────────────────────────────────────────────
export async function refundBkashPayment(trxID: string, amount: number) {
  if (BKASH_MODE === "mock") {
    console.log(`[MOCK] Refund: TrxID=${trxID}, Amount=${amount}`)
    return { success: true }
  }

  const token = await getToken()
  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/payment/refund`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      authorization: token,
      "x-app-key": BKASH_APP_KEY,
    },
    body: JSON.stringify({
      paymentID: trxID,
      amount: amount.toString(),
      trxID,
      sku: "refund",
      reason: "System error — automatic refund",
    }),
  })

  const data = await res.json()
  if (data.statusCode !== "0000") throw new Error(data.statusMessage)
  return data
}
//mock end