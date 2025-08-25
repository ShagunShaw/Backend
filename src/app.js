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



// routes import
import userRouter from "./routes/user.routes.js"

// routes declaration
// Here, we are declaring it has "/api/v1/users" because of the standard industry practice, you could have also written as "/users" also
app.use("/api/v1/users", userRouter)       // Earlier we used to do app.get() for handling such routes before all our code was in a single file. But now that our routes ad controllers are seggregated, we can cannot use them by app.get(), instead we have to now use them a middlewares using app.use() 

export default app