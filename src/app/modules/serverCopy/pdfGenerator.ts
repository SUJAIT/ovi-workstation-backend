import puppeteer from "puppeteer"

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

// ── HTML Template ─────────────────────────────────────────────────
function buildHtml(data: NidData, photoSrc: string): string {
  return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet"/>
<style>
  body {
    background-color: #ffffff;
    margin: 0;
    padding: 0;
    font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
    display: flex;
    justify-content: center;
  }
  .main-page {
    width: 890px;
    background-color: #ffffff;
    padding: 5px 60px 5px 60px;
    box-sizing: border-box;
  }
  .page-inner {
    border: 1.5px solid #6fa56f;
    background: #ffffff;
  }

  /* Header */
  .banner {
    height: 120px;
    background: linear-gradient(to bottom, #8fa08f 0%, #4c6a4c 35%, #1f3f1f 100%);
    display: flex;
    align-items: center;
    position: relative;
    border-bottom: 2px solid #2e4b2e;
  }
  .logo-area {
    width: 140px;
    height: 120px;
    background: #b4bfb7;
    border-top-right-radius: 60px;
    border-bottom-right-radius: 70px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset -18px 0 30px rgba(0,0,0,0.35), inset -4px 0 8px rgba(0,0,0,0.15);
    overflow: hidden;
  }
  .logo-area img { width: 70px; height: 80px; object-fit: contain; }
  .banner-text { margin-left: 50px; margin-top: 20px; }
  .banner-text h1 {
    font-size: 28px;
    margin: 0;
    color: #c5bebe;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.9);
    font-weight: 700;
  }
  .banner-text p {
    margin: 4px 0 0;
    font-size: 18px;
    margin-left: 50px;
    color: #e9d11a;
    font-weight: 500;
  }

  /* Search Section */
  .search-section {
    text-align: center;
    padding: 15px 0 25px 0;
    border-bottom: 1px solid #ddd;
    margin-bottom: 20px;
    position: relative;
  }
  .home-btn {
    position: absolute;
    right: 20px;
    top: 15px;
    background: #0078ff;
    color: #fff;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 13px;
    text-decoration: none;
  }
  .search-title { color: #ad2570; font-weight: bold; font-size: 20px; margin-bottom: 15px; }
  .radio-wrapper { display: flex; flex-direction: column; align-items: center; gap: 5px; margin-bottom: 18px; }
  .radio-group { display: flex; align-items: center; gap: 10px; width: 240px; font-size: 14px; }
  .green-label { color: hsl(121, 95%, 29%); font-weight: 500; }
  .blue-label { color: #31708f; font-weight: 500; }
  .search-divider { width: 60%; height: 1px; background-color: #ebe8e8; margin: 10px auto 18px auto; }
  .input-row { display: flex; justify-content: center; align-items: center; gap: 12px; }
  .label-red { color: #d9534f; font-weight: bold; font-size: 15px; }
  .nid-input { border: 1px solid #ccc; padding: 7px 8px; width: 200px; border-radius: 4px; font-size: 15px; }
  .submit-btn { background: #01a001; color: #fff; border: 1px solid #4cae4c; padding: 6px 14px; cursor: pointer; border-radius: 4px; font-size: 15px; }

  /* Main Content */
  .container { display: flex; padding: 10px 30px 30px 30px; gap: 25px; }
  .sidebar { width: 170px; text-align: center; flex-shrink: 0; }
  .profile-pic { width: 155px; height: 185px; border: 1px solid #ddd; padding: 2px; object-fit: cover; display: block; }
  .profile-pic-placeholder {
    width: 155px; height: 185px;
    border: 1px solid #ddd;
    background: #f3f4f6;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: #999;
  }
  .profile-name { font-weight: bold; font-size: 13px; margin-top: 10px; color: #333; }
  .qr-img { margin-top: 20px; width: 120px; }
  .data-panel { flex-grow: 1; }
  .table-header {
    background-color: #b2d7e9;
    padding: 6px 12px;
    font-weight: bold;
    font-size: 14px;
    border: 1px solid #bce8f1;
    color: #000;
    margin-top: 0px;
  }
  table { width: 100%; border-collapse: collapse; margin-bottom: 0px; }
  td { border: 1px solid #ddd; padding: 6px 10px; font-size: 13px; line-height: 1.5; }
  .label-cell { width: 38%; background-color: #ffffff; color: #555; }
  .value-cell { font-weight: 400; color: #000; }
  .red-text { color: #d9534f; font-weight: bold; }

  /* Footer */
  .footer { text-align: center; margin-top: 20px; padding: 15px; border-top: 1px solid #eee; }
  .foot-bn { color: #d9534f; font-weight: bold; font-size: 12px; }
  .foot-en { color: #777; font-size: 11px; margin-top: 5px; font-style: italic; }
</style>
</head>
<body>
<div class="main-page">
<div class="page-inner">

  <!-- Header -->
  <div class="banner">
    <div class="logo-area">
      <img
        src="https://res.cloudinary.com/dhzmfiv0p/image/upload/v1774025802/logo_e8kcjr.webp"
        alt="Logo"
      />
    </div>
    <div class="banner-text">
      <h1>Bangladesh Election Commission</h1>
      <p>National Identity Registration Wing (NIDW)</p>
    </div>
  </div>

  <!-- Search Section -->
  <div class="search-section">
    <a href="#" class="home-btn">Home</a>
    <div class="search-title">Select Your Search Category</div>
    <div class="radio-wrapper">
      <div class="radio-group">
        <input type="radio" checked readonly/>
        <label class="green-label">Search By NID / Voter No.</label>
      </div>
      <div class="radio-group">
        <input type="radio" readonly/>
        <label class="blue-label">Search By Form No.</label>
      </div>
    </div>
    <div class="search-divider"></div>
    <div class="input-row">
      <span class="label-red">NID or Voter No*</span>
      <input type="text" class="nid-input" value="${data.nid}" readonly/>
      <button class="submit-btn">Submit</button>
    </div>
  </div>

  <!-- Main Content -->
  <div class="container">
    <div class="sidebar">
      ${photoSrc
        ? `<img src="${photoSrc}" class="profile-pic" alt="${data.nameEn}"/>`
        : `<div class="profile-pic-placeholder">Photo</div>`
      }
      <div class="profile-name">${data.nameEn}</div>
      <img
        src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${data.nid}"
        class="qr-img"
        alt="QR"
      />
    </div>

    <div class="data-panel">

      <!-- জাতীয় পরিচিতি তথ্য -->
      <div class="table-header">জাতীয় পরিচিতি তথ্য</div>
      <table>
        <tr><td class="label-cell">জাতীয় পরিচয় পত্র নম্বর</td><td class="value-cell">${data.nid}</td></tr>
        <tr><td class="label-cell">পিন নম্বর</td><td class="value-cell">${data.pin}</td></tr>
        <tr><td class="label-cell">ভোটার নম্বর</td><td class="value-cell">${data.voterNo}</td></tr>
        <tr><td class="label-cell">সিরিয়াল নম্বর</td><td class="value-cell">${data.slNo}</td></tr>
        <tr><td class="label-cell">ভোটার এলাকা নম্বর</td><td class="value-cell">${data.voterAreaCode}</td></tr>
      </table>

      <!-- ব্যক্তিগত তথ্য -->
      <div class="table-header">ব্যক্তিগত তথ্য</div>
      <table>
        <tr><td class="label-cell">নাম (বাংলা)</td><td class="value-cell" style="font-weight:bold">${data.name}</td></tr>
        <tr><td class="label-cell">নাম (ইংরেজি)</td><td class="value-cell">${data.nameEn}</td></tr>
        <tr><td class="label-cell">জন্ম তারিখ</td><td class="value-cell">${data.dob}</td></tr>
        <tr><td class="label-cell">পিতার নাম</td><td class="value-cell">${data.father || "N/A"}</td></tr>
        <tr><td class="label-cell">মাতার নাম</td><td class="value-cell">${data.mother || "N/A"}</td></tr>
        <tr><td class="label-cell">স্বামী / স্ত্রীর নাম</td><td class="value-cell">${data.spouse || "N/A"}</td></tr>
      </table>

      <!-- অন্যান্য তথ্য -->
      <div class="table-header">অন্যান্য তথ্য</div>
      <table>
        <tr><td class="label-cell">লিঙ্গ</td><td class="value-cell">${data.gender === "male" ? "male" : "female"}</td></tr>
        <tr><td class="label-cell">ধর্ম</td><td class="value-cell">${data.religion || ""}</td></tr>
        <tr><td class="label-cell">জন্মস্থান</td><td class="value-cell">${data.birthPlace || ""}</td></tr>
        <tr>
          <td class="label-cell">রক্তের গ্রুপ</td>
          <td class="value-cell ${!data.bloodGroup ? "red-text" : ""}">${data.bloodGroup || "N/A"}</td>
        </tr>
      </table>

      <!-- বর্তমান ঠিকানা -->
      <div class="table-header">বর্তমান ঠিকানা</div>
      <table>
        <tr><td style="padding:10px; line-height:1.6;">${data.preAddressLine}</td></tr>
      </table>

      <!-- স্থায়ী ঠিকানা -->
      <div class="table-header">স্থায়ী ঠিকানা</div>
      <table>
        <tr><td style="padding:10px; line-height:1.6;">${data.perAddressLine}</td></tr>
      </table>

    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="foot-bn">উপরে প্রদর্শিত তথ্যসমূহ জাতীয় পরিচয়পত্র সংশ্লিষ্ট, ভোটার তালিকার সাথে সরাসরি সম্পর্কযুক্ত নয়।</div>
    <div class="foot-en">This is Software Generated Report From Bangladesh Election Commission, Signature & Seal Aren't Required.</div>
  </div>

</div>
</div>
</body>
</html>`
}

// ── PDF Generator ─────────────────────────────────────────────────
export async function generateNidPdf(data: NidData): Promise<Buffer> {
  const photoSrc = data.photo ? await photoToBase64(data.photo) : ""
  const html = buildHtml(data, photoSrc)

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1000, height: 1400 })
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    })

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}