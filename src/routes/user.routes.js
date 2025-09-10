// In Express, a router is a way to define a group of routes that are related to a particular part of your application. For
// example, if we go to "/user", there we had two options 'register' and 'login'. So instead of declaring each route individully in our
// app.js we are taking a common part from app.js i.e. the "/user" and then handling it's "/register" and "/login" here

import { Router } from "express"
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword } from "../controllers/user.controller.js"
import { getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js"
import { getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT, verifyJWT_forRefreshToken } from "../middlewares/auth.middleware.js"

const userRouter= Router()

// So overall our path would be: http://localhost:8000/api/v1/users/register
userRouter.route("/register").post(         // like we used to do na app.get(), app.post() we are doing the same thing here as now our routes are being handled by router, so this is the way of doing these things like post(), get() in a router
    upload.fields([     // This acts as a middleware which enable us to handle files which will be uploaded to our server, as we cannot handle it directly in our 'user.controller.js' file 
        // Since we need to take two files (i.e avatar and coverImg), so we are creating two objects only
        {
            name: "avatar",     // This name should match with the name of variable in frontend in which our 'avatar' is being uploded
            maxCount: 1         // 'maxCount' tells that under this section we only need 1 file to be uploaded
        },         
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)        

userRouter.route("/login").post(upload.none() , loginUser)          // For every route, we need to inject a middleware, either with some value as above or with none() as here.  (Yh waala bug hm khud fix kiye h, yh lecture ka part ni h)

// Secured Routes
userRouter.route("/logout").post(verifyJWT, upload.none(), logoutUser)

// We can also inject more than one middleware in a single route like this:
// userRouter.route("/logout2").post(verifyJWT, middleware2, middleware3, logoutUser)           
// just make sure each of these middlewares should end with 'next()' , so that after one middleare has been executed, it can move to the next middleware, before going 
// to the main function i.e. 'logoutUser' here



userRouter.route("/refresh-token").post(upload.none(), verifyJWT_forRefreshToken, refreshAccessToken)

userRouter.route("/change-password").post(upload.none(), verifyJWT, changeCurrentPassword)

userRouter.route("/current-user").get(upload.none(), verifyJWT, getCurrentUser)


// Here, we are writing 'patch' instead of 'post' because here we are updating a value in our database, so for updation, we use 'patch'
userRouter.route("/update-account").patch(upload.none(), verifyJWT, updateAccountDetails)


// Yha pe phle 'verifyJWT' hoga then 'upload.single()' coz our primary condition is ki phle user logged in hona cahiye, then wo file upload krr skta h updation k liye
// Here, we are using 'upload.single()' instead of 'upload.fields()' coz yha pe sirf ek file hi aayega by the user side
userRouter.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)



userRouter.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
// NOTE: The name under the 'upload.single()' part should match with the name that is being used for taking up the value for that particular thing in frontend


// This one is new (as now we are sending the encoded url in this route). See this one
userRouter.route("/channel/:username").get(verifyJWT, upload.none(), getUserChannelProfile)


userRouter.route("/history").get(verifyJWT, upload.none(), getWatchHistory)
// Dekh lo yha pe shyd 'get' k saath 'upload.none()' ni likhna hoga. Let's see what our output comes.


export default userRouter