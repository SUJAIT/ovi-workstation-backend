const htmlPdf = require("html-pdf-node")

type NidData = {
  name: string
  nameEn: string
  nid: string
  pin: string
  dob: string
  father: string
  mother: string
  spouse: string
  bloodGroup: string
  gender: string
  birthPlace: string
  religion: string
  voterNo: string
  slNo: number
  voterArea: string
  voterAreaCode: number
  preAddressLine: string
  perAddressLine: string
  photo: string
}

// ── Photo → base64 ────────────────────────────────────────────────
async function photoToBase64(url: string): Promise<string> {
  try {
    const res = await fetch(url)
    if (!res.ok) return ""
    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const ct = res.headers.get("content-type") || "image/jpeg"
    const mime = ct.includes("webp") || ct.includes("svg") ? "image/jpeg" : ct
    return `data:${mime};base64,${base64}`
  } catch {
    return ""
  }
}

// ── HTML Template ──────────────────────────────────────────────────
function buildHtml(data: NidData, photoSrc: string): string {
  return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8"/>
<title>NID Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background-color: #fff; font-family: 'Hind Siliguri', Arial, sans-serif; display: flex; justify-content: center; }
  .main-page { width: 850px; background-color: white; min-height: 1100px; position: relative; }
  .banner { background: linear-gradient(to right, #1d4d2a 0%, #468a41 60%, #8cc63f 100%); height: 105px; display: flex; align-items: center; padding: 0 25px; color: white; border-bottom: 4px solid #8cc63f; }
  .logo-circle { background: white; border-radius: 50%; width: 78px; height: 78px; display: flex; justify-content: center; align-items: center; margin-right: 20px; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
  .logo-circle img { width: 68px; height: 68px; object-fit: contain; }
  .banner-text h1 { font-size: 26px; font-family: 'Times New Roman', Times, serif; font-weight: bold; letter-spacing: 0.5px; }
  .banner-text h2 { font-size: 17px; color: #ffff00; font-weight: normal; margin-top: 3px; }
  .search-section { text-align: center; padding: 16px 20px; background-color: #fcfcfc; border-bottom: 1px solid #ddd; }
  .search-title { color: #c2185b; font-weight: bold; font-size: 14px; margin-bottom: 10px; }
  .radio-row { font-size: 13px; color: #333; margin-bottom: 8px; }
  .input-row { display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 10px; }
  .label-red { color: #ff0000; font-weight: bold; font-size: 13px; }
  .nid-input { border: 1px solid #ccc; padding: 5px 8px; width: 140px; font-size: 13px; }
  .submit-btn { background: #4caf50; color: white; border: none; padding: 5px 18px; cursor: pointer; border-radius: 2px; font-weight: bold; font-size: 13px; }
  .container { display: flex; padding: 25px 35px; gap: 35px; }
  .sidebar { width: 155px; text-align: center; flex-shrink: 0; }
  .profile-pic { width: 148px; height: 178px; border: 1px solid #999; padding: 2px; object-fit: cover; display: block; }
  .profile-pic-placeholder { width: 148px; height: 178px; border: 1px solid #999; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #6b7280; }
  .profile-name { font-weight: bold; font-size: 14px; margin-top: 8px; color: #333; }
  .qr-box { width: 120px; height: 120px; border: 1px solid #555; margin: 20px auto 0; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #777; }
  .data-panel { flex-grow: 1; }
  .table-header { background-color: #d9edf7; padding: 7px 14px; font-weight: 700; font-size: 13.5px; border: 1px solid #bce8f1; color: #31708f; margin-top: 14px; }
  .table-header:first-child { margin-top: 0; }
  table { width: 100%; border-collapse: collapse; }
  td { border: 1px solid #ddd; padding: 7px 12px; font-size: 13px; vertical-align: middle; line-height: 1.5; }
  .label-cell { width: 42%; background-color: #f9f9f9; color: #555; }
  .value-cell { width: 58%; font-weight: 600; color: #000; }
  .red-text { color: #ff0000 !important; }
  .addr-cell { font-weight: 600; line-height: 1.7; padding: 10px 12px; }
  .footer { text-align: center; margin-top: 40px; padding: 18px 20px; border-top: 1px solid #eee; }
  .foot-bn { color: #ff0000; font-weight: bold; font-size: 12.5px; margin-bottom: 5px; }
  .foot-en { color: #777; font-size: 11px; font-style: italic; }
</style>
</head>
<body>
<div class="main-page">
  <div class="banner">
    <div class="logo-circle">
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Seal_of_Bangladesh.svg/200px-Seal_of_Bangladesh.svg.png" alt="Logo"/>
    </div>
    <div class="banner-text">
      <h1>Bangladesh Election Commission</h1>
      <h2>National Identity Registration Wing (NIDW)</h2>
    </div>
  </div>
  <div class="search-section">
    <div class="search-title">Select Your Search Category</div>
    <div class="radio-row">&#9679; Search By NID / Voter No. &nbsp;&nbsp; &#9675; Search By Form No.</div>
    <div class="input-row">
      <span class="label-red">NID or Voter No*</span>
      <input type="text" class="nid-input" value="${data.nid}" readonly />
      <button class="submit-btn">Submit</button>
    </div>
  </div>
  <div class="container">
    <div class="sidebar">
      ${photoSrc
        ? `<img src="${photoSrc}" class="profile-pic" alt="${data.nameEn}"/>`
        : `<div class="profile-pic-placeholder">Photo</div>`
      }
      <div class="profile-name">${data.nameEn}</div>
      <div class="qr-box">QR Code</div>
    </div>
    <div class="data-panel">
      <div class="table-header">জাতীয় পরিচিতি তথ্য</div>
      <table>
        <tr><td class="label-cell">জাতীয় পরিচয় পত্র নম্বর</td><td class="value-cell">${data.nid}</td></tr>
        <tr><td class="label-cell">পিন নম্বর</td><td class="value-cell">${data.pin || "N/A"}</td></tr>
        <tr><td class="label-cell">ভোটার নম্বর</td><td class="value-cell">${data.voterNo || "N/A"}</td></tr>
        <tr><td class="label-cell">সিরিয়াল নম্বর</td><td class="value-cell">${data.slNo || "N/A"}</td></tr>
        <tr><td class="label-cell">ভোটার এলাকা নম্বর</td><td class="value-cell">${data.voterAreaCode || "N/A"}</td></tr>
      </table>
      <div class="table-header">ব্যক্তিগত তথ্য</div>
      <table>
        <tr><td class="label-cell">নাম (বাংলা)</td><td class="value-cell">${data.name}</td></tr>
        <tr><td class="label-cell">নাম (ইংরেজি)</td><td class="value-cell">${data.nameEn}</td></tr>
        <tr><td class="label-cell">জন্ম তারিখ</td><td class="value-cell">${data.dob}</td></tr>
        <tr><td class="label-cell">পিতার নাম</td><td class="value-cell">${data.father || "N/A"}</td></tr>
        <tr><td class="label-cell">মাতার নাম</td><td class="value-cell">${data.mother || "N/A"}</td></tr>
        <tr><td class="label-cell">স্বামী / স্ত্রীর নাম</td><td class="value-cell">${data.spouse || "N/A"}</td></tr>
      </table>
      <div class="table-header">অন্যান্য তথ্য</div>
      <table>
        <tr><td class="label-cell">লিঙ্গ</td><td class="value-cell">${data.gender === "male" ? "male" : "female"}</td></tr>
        <tr><td class="label-cell">ধর্ম</td><td class="value-cell">${data.religion || ""}</td></tr>
        <tr><td class="label-cell">জন্মস্থান</td><td class="value-cell">${data.birthPlace || ""}</td></tr>
        <tr><td class="label-cell">রক্তের গ্রুপ</td><td class="value-cell ${!data.bloodGroup ? "red-text" : ""}">${data.bloodGroup || "N/A"}</td></tr>
      </table>
      <div class="table-header">বর্তমান ঠিকানা</div>
      <table><tr><td class="addr-cell">${data.preAddressLine}</td></tr></table>
      <div class="table-header">স্থায়ী ঠিকানা</div>
      <table><tr><td class="addr-cell">${data.perAddressLine}</td></tr></table>
    </div>
  </div>
  <div class="footer">
    <div class="foot-bn">উপরে প্রদর্শিত তথ্যসমূহ জাতীয় পরিচয়পত্র সংশ্লিষ্ট, ভোটার তালিকার সাথে সরাসরি সম্পর্কযুক্ত নয়।</div>
    <div class="foot-en">This is Software Generated Report From Bangladesh Election Commission, Signature & Seal Aren't Required.</div>
  </div>
</div>
</body>
</html>`
}

// ── Main PDF generator ────────────────────────────────────────────
export async function generateNidPdf(data: NidData): Promise<Buffer> {
  const photoSrc = data.photo ? await photoToBase64(data.photo) : ""
  const html = buildHtml(data, photoSrc)

  const file = { content: html }

  const options = {
    format: "A4",
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
    ],
  }

  const pdfBuffer: Buffer = await htmlPdf.generatePdf(file, options)
  return pdfBuffer
}