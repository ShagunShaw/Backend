import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectDB= async () => {          // Standard approach every time you should follow
    try{        
        const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log("MongoDB Connected!! DB Host: ", connectionInstance.connection.host)
    }
    catch(error)
    {
        console.log("MongoDb Connection Failed: ", error)
        process.exit(1)         //  Returns to the original file from where this function is called. 0: Process successful ; any number other than 0: process failed
    }
}


export default connectDB        // By using the 'default' keyword, there is no need for { } while importing this function in a file because it's the default export