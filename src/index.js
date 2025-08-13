// Approach 2

import dotenv from 'dotenv'             // from now we are using 'import' instead of 'require' for dotenv
dotenv.config({
    path: './env'
})

import connectDB from './db/index.js'

connectDB()


// Approach 1

/*
import mongoose from 'mongoose'
import { DB_NAME } from './constants.js'       


import express from 'express'
const app= express()

( async () => {         // This is the ideal format for creating a database and you should always follow it
    try {           // To catch Errors during DB connection or setup
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error", (err) => {        // "error" is a special, built-in event name. This line of code is used to catch Server-level (runtime) errors
            console.log("Error message: ", err)
            throw err
        })

        app.listen(process.env.PORT, () => {
            console.log("App is running on port ", process.env.PORT)
        })
    }
    catch (error) {
        console.error("Your error message is: ", error)
        throw error         //  This means that the error is thrown back to the calling code i.e. outside the function in this case
    }
})()

*/