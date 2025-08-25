// In Express, a router is a way to define a group of routes that are related to a particular part of your application. For
// example, if we go to "/user", there we had two options 'register' and 'login'. So instead of declaring each route individully in our
// app.js we are taking a common part from app.js i.e. the "/user" and then handling it's "/register" and "/login" here

import { Router } from "express"
import { registerUser } from "../controllers/user.controller.js"

const userRouter= Router()

// So overall our path would be: localhost:8000/api/v1/users/register
userRouter.route("/register").post(registerUser)        // like we used to do na app.get(), app.post() we are doing the same thing here as now our routes are being handled by router, so this is the way of doing these things like post(), get() in a router

export default userRouter