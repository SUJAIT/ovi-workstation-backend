import axios from "axios"

const getSnidInfoFromApi = async (payload: {
  nid: string
  dob: string
}) => {

  try {

    const { nid, dob } = payload

    const url = `https://ovi-workstation-backend.onrender.com/example/exampleApi?nid=${nid}&dob=${dob}`

    const response = await axios.get(url)

    return response.data

  } catch (error: any) {

    return {
      status: "error",
      message: error.message
    }

  }

}

export const SnidService = {
  getSnidInfoFromApi
}