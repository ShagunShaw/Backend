import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'

const app= express()

// app.use(cors())         // Allows all cross-origin platforms to fetch data from app
app.use(cors({          // Allows only specific cross orgin platforms (specified under process.env.CORS_ORIGIN) to fetch data from app
    origin: process.env.CORS_ORIGIN,
    credentials: true       // 'credentials: true' tells the browser to include credentials (cookies, HTTP authentication, etc.) in cross-origin requests.
}))


// Adding middlewares to the Express request-handling pipeline.
// Middlewares are the pre-checks that ensure everything is good to go before your server gives a response to an imcoming request.
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))       // Here, 'public' is the folder we have created not a keyword
app.use(cookieParser())         // To set and access cookies on my server


export default app