import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"

// Yha prr shyd ek part ni kiya hua h ki after the given time jb hamara access token expire hojaye and using the 
// refresh token hume naya access token generate krna pdhe toh uss case mei kaise refresh token verify krke naya 
// access token generate krke 'res' mei set kre. Toh dekhlo agr yh part ni kiya h toh isko ek baar khus se try krna.

export const verifyJWT= asyncHandler(async (req, res, next) => {        // Middlewares mei hamesha 'next' likhna hi cahiye
    try
    {   
        const token= req.cookies?.accessToken  ||  req.header("Authorization")?.replace("Bearer ", "")          // understand 'req.header("Authorization")?.replace("Bearer ", "")' part from GPT, mko toh samj aagya btt iska note banana possible ni th

        if(!token)
        {
            throw new ApiError(401, "Unauthorized Request")
        }



        const decodedToken= await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)            // So iss 'decodedToken' k andar wo payloads aa jayega jiske basis pe hmlog access token banaye th. Also this line will verify whether our access token has expired or not. If yes, then it will throw an error which will be caught in the catch block below

        const user= await User.findById(decodedToken?._id)      // This _id is not from the database, it's from the key we had given for our '_id' of our database while creating the JWT Token
                .select("-password -refreshToken")

        if(!user)
        {
            throw new ApiError(401, "Invalid Access Token")
        }

        
        req.user= user      // this 'req.user' is a custom value that we had created of our own. This the only syntax for writing a custom value for both 'res' and 'req' i.e. by giving an = (equal to) sign
        next()    // Important to write next() in the end while defining any middleware
    } 
    catch (error) 
    {
        if(error?.message === "jwt expired")  
        {
            throw new ApiError(401, "Your access token has expired. Please call the /refresh-token path to continue.")
        }

        throw new ApiError(401,  error?.message  ||  "Something went wrong while authentication")
    }
})



export const verifyJWT_forRefreshToken= asyncHandler(async (req, res, next) => {        // Middlewares mei hamesha 'next' likhna hi cahiye
    try
    {   
        const token= req.cookies?.refreshToken          
        if(!token)
        {
            throw new ApiError(401, "Unauthorized Request as we cannot find any refresh token")
        }



        const decodedToken= await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)            // So iss 'decodedToken' k andar wo payloads aa jayega jiske basis pe hmlog refresh token banaye th. Also this line will verify whether our refresh token has expired or not. If yes, then it will throw an error which will be caught in the catch block below


        const user= await User.findById(decodedToken?._id)      // This _id is not from the database, it's from the key we had given for our '_id' of our database while creating the JWT Token
                .select("-password -refreshToken")


        // Meko yha pe yh user return ni krna h, bas yha prr check krna h ki given refresh token valid h ya ni, so agr valid h toh next() krdo, ni toh error throw krdo
        if(!user)
        {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        next()    
    } 
    catch (error) 
    {
        if(error?.message === "jwt expired")  
        {
            throw new ApiError(401, "Your refresh token has also been expired. Please login again this time to continue.")
        }

        throw new ApiError(401,  error?.message  ||  "Something went wrong while authentication")
    }
})