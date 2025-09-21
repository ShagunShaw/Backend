import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { generateOnlyAccessToken } from "../utils/jwtToken.js";
import jwt from "jsonwebtoken";



// Handling Session expires using refreshTokens
// Yha pe just ek baar yh logic check krr lena ki how to check, while the user is logged in, ki uska access token expire hogya h
// and we have to inject this method via it's route defined in user.router.js to create it's new access token and assigning toh iss
// function k andar hi hogya h
export const refreshAccessToken= asyncHandler( async (req, res) => {
    const incomingRefreshToken= req.cookies.refreshToken   ||   req.body.refreshToken

    if(!incomingRefreshToken)
    {
        throw new ApiError(401, "Unauthorized Request as no refresh token is present")
    }


    try
    {
        const decodedToken= jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)


        const user= await User.findById(decodedToken?._id)         // Here we are using ?. opearator beacause jaruri ni h ki hamare decoded token mei payloads (data) ho hi, it may be that refreshToken define krte waqt hmlog usme koi payloads na daale ho

        if(!user)
        {
            throw new ApiError(401, "Invalid Refresh Token")
        }



        if(incomingRefreshToken !== user.refreshToken)
        {
            throw new ApiError(401, "Refresh Token is either expired or used. Please login again")
        }




        const {accessToken}= await generateOnlyAccessToken(user._id)       // Yha pe Access Token ka naam should be same as you had given while returning values from the given function. Ni toh bahaut der phasoge

        const options= {
            httpOnly: true,
            secure: false        // Remember, development k time false, production k time true
        }

        return res.status(200)
                .cookie("accessToken", accessToken, options)
                .json(new ApiResponse(
                                        200,
                                        {accessToken},
                                        "Access Token refreshed successfully"
                                    ))
    }
    catch(error)
    {
        throw new ApiError(401, error?.message  ||  "Something went wrong while refreshing our Access Token")
    }
} )