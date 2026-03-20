import { Request, Response } from "express"

const exampleApi = async (req: Request, res: Response): Promise<void> => {
  try {
    const nid = req.query.nid as string
    const dob = req.query.dob as string

    // ✅ validation check
    if (!nid || !dob) {
      res.status(400).json({
        status: "error",
        message: "nid and dob are required"
      })
      return
    }

    // ✅ main condition
    if (nid === "1004375018" && dob === "1976-07-05") {
      res.status(200).json({
        Api: "National Identity Info",
        "API OWNER NAME": "Demo Server",
        "API OWNER CONTACT": "https://example.com",
        status: "success",

        name: "মোঃ সেলিম",
        nameEn: "Md. Selim",
        nid: "1004375018",
        pin: "19761511250571438",
        dob: "1976-07-05",

        father: "মোঃ শফিক",
        fatherNid: "",
        mother: "পাখিজা খাতুন",
        motherNid: "",

        bloodGroup: "",
        gender: "male",

        preAddressLine:
          "বাসা/হোল্ডিংঃ আতর আলীর বাড়ী, পোস্ট অফিসঃ পশ্চিম গোমদন্ডী, পোস্ট কোডঃ 4366, উপজেলাঃ বোয়ালখালী, জেলাঃ চট্টগ্রাম",

        perAddressLine:
          "বাসা/হোল্ডিংঃ আতর আলীর বাড়ী, পোস্ট অফিসঃ পশ্চিম গোমদন্ডী, পোস্ট কোডঃ 4366, উপজেলাঃ বোয়ালখালী, জেলাঃ চট্টগ্রাম",

        preAddress: {
          houseOrHoldingNo: "আতর আলীর বাড়ী",
          unionOrWard: "0",
          postOffice: "পশ্চিম গোমদন্ডী",
          postalCode: "4366",
          upozila: "বোয়ালখালী",
          district: "চট্টগ্রাম",
          division: "চট্টগ্রাম"
        },

        perAddress: {
          houseOrHoldingNo: "আতর আলীর বাড়ী",
          unionOrWard: "5",
          postOffice: "পশ্চিম গোমদন্ডী",
          postalCode: "4366",
          upozila: "বোয়ালখালী",
          district: "চট্টগ্রাম",
          division: "চট্টগ্রাম"
        },

        birthPlace: "চট্টগ্রাম",
        religion: "Islam",

        voterNo: "682178687018",
        slNo: 1809,
        voterArea: "পশ্চিম গোমদন্ডী",
        voterAreaCode: 960514,

        spouse: "লায়লা বেগম",
        occupation: "ব্যবসা",
        mobile: "01700000000",

        photo: "https://res.cloudinary.com/dhzmfiv0p/image/upload/v1774026038/Screenshot_2026-03-19_020257_cal15t.png"
      })
      return
    }

    // ❌ not found
    res.status(404).json({
      status: "not_found",
      message: "No data found"
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
  exampleApi
}