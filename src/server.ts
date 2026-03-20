
import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";



const port = 5000

async function server() {

    try {

        await mongoose.connect(config.database_url as string);

        await seedSuperAdmin() 

        app.listen(port, () => {
            console.log(`server is Running a ${port}`)
        })

    } catch (error) {
        console.error(error)
    }


}

server()