
// // import dotenv from "dotenv"
// // dotenv.config()

// import admin from "firebase-admin"


// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_KEY as string)

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   })
// }

// export default admin


import dotenv from "dotenv"
dotenv.config()

import admin from "firebase-admin"

let serviceAccount

if (process.env.FIREBASE_SERVICE_KEY) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_KEY)
} else {
  serviceAccount = require("./firebase-service-key.json")
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

export default admin