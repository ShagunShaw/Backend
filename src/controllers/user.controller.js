import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";
import fs from "fs/promises";



// Registering the USER
const registerUser= asyncHandler( async (req, res) => {     // I think yha pe 'next' waala parameter bhi add hoga. But let it be for now, let's see if sir isko corrct krwate h toh
    // res.status(200).json({message: "okk"})           // This response can be viewed in our postman

    // Steps to be followed:
    // 1) Get user details from frontend
    // 2) Validation checks
    // 3) Check if user already exists
    // 4) Check for images and avatar to be present
    // 5) Upload the images and avatar to cloudinary
    // 6) After uploading, we will check if the files has been properly upoaded or not
    // 7) Create an object of user will all the info given (including the images, avatars, etc.)  
    //      and upload it to our database. We need to create an object of the user because mongoDB 
    //      is a non-relational database and so it stores object-type entries in it (you already know it). 
    // 8) After uploading the date to cloudinary, remove 'password' and 'refresh token' field from our 
    //      response, before sending the response to our frontend
    // 9) Check if new user has been successfully created or not, if yes then we will send the success 
    //    response else the error response



    const { fullName, email, username, password } = req.body        
    // This a destructuring assignment in JS which unpacks the properties of the 'req.body' object into individual variables. This means: 'fullname' will store the value of 'req.body.fullname', 'email' will store the value of 'req.body.email' and so on.
    // Acha remember using this technique you can only handle datas, not the files. For handling files, we have a different way to handle it in 'user.routes.js' file
    console.log("Email: ", email)

    







    // Checking if the fields have non-empty values, if yes then throw an error
    if(fullName === "")
    {
        throw new ApiError(400, "fullnname is required")        // there were many other parameters in 'ApiError', but since they had their deafult values, so for now we are not passing anything here for them
    }
    if(email === "")
    {
        throw new ApiError(400, "email is required")      // yh throw wala part chla jaayega asyncHandler k catch-block mei   
    }
    if(username === "")
    {
        throw new ApiError(400, "username is required")        
    }
    if(password === "")
    {
        throw new ApiError(400, "password is required")        
    }


    // Checking if the email is in correct format or not
    if(!email.includes("@")  ||   !email.includes(".com"))
    {
        throw new ApiError(400, "Check your email format")
    }









    const existedUser= await User.findOne({
        $or: [{username}, {email}]      // This is a just a way of writing: if 'username' OR 'email' is presnt then return true. '$or' represents our OR operator and the values in the two objects are the conditions to be checked 
    })

    if(existedUser === true)
    {
        throw new ApiError(409, "User with either same username or same email already existed")
    }







    const avatarLocalPath= req.files?.avatar?.[0]?.path       // If files is not present under req  ||   avatar[0] does not have anything, then it will return 'undefined' (rather than throwing an error coz we are using the ? operator), and we know that in JS 'udefined' is a falsy value
    const coverImageLocalPath= req.files?.coverImage?.[0]?.path
    // Wrong Syntax 1: const coverImageLocalPath= req.files?.coverImage[0]?.path            // You should give a ? after coverImage also coz if the coverImage is not present, then we won't be able to access it's value at [0] and thus it will throw an error
    // Wrong Syntax 2: const coverImageLocalPath= req.files?.coverImage?[0]?.path           // We should always give a . after every ? while chaining in this form

    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is required")
    }
    // Now we are not going to check for the coverImage (as it is a non-compulsary field)


    if(coverImageLocalPath  &&   avatarLocalPath === coverImageLocalPath)
    {
        throw new ApiError(400, "Avatar and Cover Image cannot be same")
    }





    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)     // the +ve thing about cloudinary is that if our 'coverImageLocalPath' is 'undefined' (i.e. if the user has not uploaded the cover image), then it is not giving an error, it is just keeping it as it as and then we are handling this part later in this code

    if(!avatar)
    {
        throw new ApiError(400, "avatar file has not been uploaded properly to cloudinary")
    }
    // Now we are not going to check for the coverImage (as it is a non-compulsary field)



    const user= await User.create({         // Now our entry has been added to our database, and the 'user' will contain the reference of this data with all the fields you have mentioned here
        fullName: fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url   ||   "" ,      // Since coverImage was a non-compulsary field so before adding the url to our database we are checking if 'coverImage' is actually present or not using the ? operator. If not, then we are storing an empty string "" there
        email: email,
        password: password,
        username: username.toLowerCase() 
        // refreshToken: User.generateRefreshToken        // You cannot call this function here at the time of user creation
    })

    // Rather you can call it here like this,
    // user.refreshToken = user.generateRefreshToken()
    // await user.save({validateBeforeSave: false}) 









    // Now after adding the entry to the database, we are getting a copy of the new entry for various purpose like checking if the entry has been properly uploaded or not, or to print the new entry as output, etc.
    const createdUserResponse= await User.findById(user._id).select(     // this 'select' is different. In this we are not selecting the constraints that we want, rather we are selecting the contraints we don't want by using "-constraint_name", then space then another constraint name like this only       
        "-password -refreshToken"
    )








    if(!createdUserResponse)
    {
        throw new ApiError(500, "Something went wrong while registering the user")
    }






    const response= new ApiResponse(200, createdUserResponse, "User registered Successfully")
    return res.status(201).json(response)

})





export const generateAccessAndRefreshTokens= async (userId) => {
    try 
    {
        const user= await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()

        user.refreshToken= refreshToken
        await user.save({validateBeforeSave: false})      // yha pe isko 'false' isliye kiye kyuki agr ni krte toh refresh token update krte time yh mere se baki saara required fields bhi maangta jaise password, email and all. Yha isko bol diye ki jaisa bole h waisa kro apna dimaag mtt chalao
    
        return {accessToken, refreshToken}
    } 
    catch (error) {
        throw new ApiError(500, `Something went wrong while generating the token and the error is ${error}`)
    }
}


export const generateOnlyAccessToken= async (userId) => {
    try 
    {
        const user= await User.findById(userId)
        const accessToken= user.generateAccessToken()


        return {accessToken}
    } 
    catch (error) {
        throw new ApiError(500, `Something went wrong while generating the new access token and the error is ${error}`)
    }
}


// Logging in the USER
const loginUser= asyncHandler(async (req, res) => {
    // Step to be followed:
    // 1) Bring the data from 'req.body', which the user enters for logging
    // 2) Here we will loggin user via email or via username (any of them)
    // 3) After getting your data (username or email), find the user in you DB
    // 4) If the user is not found, show the error message. If found, then check if the password is
    //    correct or not. If no, then show "Incorrect Password", else follow the below step
    // 5) If the password is correct, then generate your access and refresh token
    // 6) And then send these token to the user via secure Cookies.
    // 7) And now that  every thing is done, show success message to the user: "Successfully Logged In"


    const {userIdentifier, password}= req.body       // Between username and email, the user can give only one

    // Now between username and email, it's compulsory that we need one. It cannot be that user ne username and email dono hi ni diya
    if(!userIdentifier)
    {
        throw new ApiError(400, "username or email is required.")
    }





    const user = await User.findOne({
        $or: [
            { email: userIdentifier },                 // match by email
            { username: userIdentifier.toLowerCase() } // match by username (stored as lowercase on registration)
        ]
    })

    if(!user)
    {
        throw new ApiError(404, "User does not exist")
    }









    const isPasswordValid= await user.isPasswordCorrect(password)     
    if(!isPasswordValid)
    {
        throw new ApiError(401, "Password is Incorrect")
    }






    
    const {accessToken, refreshToken}= await generateAccessAndRefreshTokens(user._id)       // Yha pe Refresh Token and Access Token ka naam should be same as you had given while returning values from the given function. Ni toh bahaut der phasoge




    // Aacha ek aur cheez, though iss function call k baad mere user mei refresh token aagya h (ya update hogya h), but still mere paas jo abhi waala
    // user ka reference h 'user', usme yh changes abhi propagate ni hua h i.e. mere 'user' mei abhi bhi refresh token (or updated refresh token) ni aaya h.
    // Iske baad agr hmlog 'const user= await User.findOne({ $or: [{username}, {email}] })' yh krte h then isme updated waala aa jayega
    
        
    const updatedUser= await User.findById(user._id).select("-password -refreshToken")

    const options= {
        httpOnly: true,
        secure: false       // development k time isko false krr dena, production k time isko true krr dena. This is because development k time pe hamara url http hota h and not https, so agr isme secure: true krr denge toh yh hamare cookies ko allow ni karega    
    }

    
    // the 'req' and 'res' object contains both built-in values (like res.status, res.cookie, res.json and values like req.body, req.params) as well as values that are custom-defined (like req.user, res.someData, etc.) by you or your middleware
    return res.status(200)          // This the only syntax for writing a built-in value for both 'res' and 'req' i.e. by giving the value in brackets ()
              .cookie("accessToken", accessToken, options)      // to use this, you must have written 'app.use(cookieParser())' in your app.js file.  The accessToken in quotes is the name of the cookie we have given and the one without quotes, is the value of that cookie
              .cookie("refreshToken", refreshToken, options)      // You can also chain multiple values like this
              .json(new ApiResponse(200, {
                                            user: updatedUser,      // See how this data is printed in our output.
                                            accessToken,        // Here this line simply means this -->  accessToken: accessToken        // phla waala accessToken is my key and dusra waala is my value. Now since dono ka naam same hi h so yes, we can write like this
                                            refreshToken        
                                         }, "User Logged In Successfully"))
})





// Logging out the USER. For this, we need to create a new middleware.
const logoutUser= asyncHandler(async (req, res) => {
    // Steps to be followed
    // 1) Update the 'refreshToken' field of our user in the database to be null (or undefined)
    // 2) Clear all the cookies (including our access Token and refresh Token)

    
    const response= await User.findByIdAndUpdate( 
                                        req.user._id,       // Now req.user is not a built-in value, it's a custom value created by us
                                        {
                                            $set: {         // Remember: $or, $set  these are all methods of mongoose, not a javascript syntax
                                                refreshToken: null
                                            }
                                        },
                                        {
                                            new: true       // This 'new: true' will return the updated user response (i.e. the one in which 'refreshToken' is undefined). If 'new: false', then it would have given the non-updated response
                                        }
                                    )
    

    const options= {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
              .clearCookie("accessToken", options)      // "accessToken" is the name of the cookie that we had declared earlier
              .clearCookie("refreshToken", options)
              .json(new ApiResponse(200, {}, "User Logged Out Successfully"))

})








const changeCurrentPassword= asyncHandler(async (req, res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body

    if(confirmPassword  !==  newPassword)
    {
        throw new ApiError(400, "New Password and Confirm Password are not the same")
    }


    const user= await User.findById(req.user?._id)    

    const isPasswordCorrect = await user.isPasswordCorrect( oldPassword)


    if(!isPasswordCorrect)
    {
        throw new ApiError(400, "Invalid old password")
    }

    user.password= newPassword      // yha pe password ko encrypt krne ka jarurat ni h, coz user.model mei hmlog ek pre("save") k andar apna password already encrpt krre h
    await user.save({validateBeforeSave: false})

    return res.status(200)
              .json(new ApiResponse(200,
                                    {},
                                    "Password Changed Successfully"
                                   ))
})







const getCurrentUser= asyncHandler(async (req, res) => {
    return res.status(200)
              .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})





const updateAccountDetails= asyncHandler(async (req, res) => {
    const {fullName, email}= req.body
    // Suggestion: Jitna bhi text data h that you cam update here in one function, butt agr files update krna h toh it's suggested ki uske liye ek alg function define kro, coz
    //              jb bhi hm update krte h toh ek baar k liye pura data kind of refresh ho jaata h, toh agr files updation ko different function mei define krte h toh network pe
    //              congestion kam hota h.

    if(!fullName  &&  !email)
    {
        throw new ApiError(400, "At least one of fullName or email is required for updation")
    }

    
    if(fullName)
    {
        await User.findByIdAndUpdate(req.user?._id,
                                    {
                                        $set: {fullName: fullName}
                                    },
                                    {           // We may or may not give this parameter. You already know it's functionality
                                        new: true
                                    }         
                                    )
    }

    
    if(email)        
    {
        if(!email.includes("@")  ||   !email.includes(".com"))
        {
            throw new ApiError(400, "Check your new email format")
        }
        

        await User.findByIdAndUpdate(req.user?._id,
                                    {
                                        $set: {email: email}
                                    },
                                    {new: true}         
                                    )
    }


    const user= await User.findById(req.user?._id).select("-password -refreshToken")

    return res.status(200)
              .json(new ApiResponse(200, user, "Account updated successfully"))
})





// ToDo- while uploading new image on cloudinay, delete the old image from it
const updateUserAvatar= asyncHandler(async (req, res) => {
    const avatarLocalPath= req.file?.path      // yha pe 'req.file' hoga 'req.files' ni coz yha sirf ek hi file upload krwa rhe h user se

    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)


    if(!avatar.url)
    {
        throw new ApiError(400, "Error while uploading the file on Cloudinary")
    }

    const response= await User.findByIdAndUpdate(req.user._id,
                                 {
                                    $set: {
                                        avatar: avatar.url
                                    }
                                 },
                                 {
                                    new: true
                                 }
                                ).select("-password -refreshToken")
    
    return res.status(200)
              .json(new ApiResponse(200,
                                    response,
                                    "Avatar updated successfully"))
})





// ToDo- same as above
const updateUserCoverImage= asyncHandler(async (req, res) => {
    const coverLocalPath= req.file?.path      // yha pe 'req.file' hoga 'req.files' ni coz yha sirf ek hi file upload krwa rhe h user se

    if(!coverLocalPath)
    {
        throw new ApiError(400, "Cover Image is missing")
    }

    const coverImage= await uploadOnCloudinary(coverLocalPath)


    if(!coverImage.url)
    {
        throw new ApiError(400, "Error while uploading the file on Cloudinary")
    }

    const response= await User.findByIdAndUpdate(req.user._id,
                                 {
                                    $set: {
                                        coverImage: coverImage.url       // '.url' likhna mtt bhulna
                                    }
                                 },
                                 {
                                    new: true
                                 }
                                ).select("-password -refreshToken")
    
    return res.status(200)
              .json(new ApiResponse(200,
                                    response,
                                    "Cover Image updated successfully"))
})







// Yh wala part samjhne k liye subscription schema samj k aao. lecture 19
const getUserChannelProfile= asyncHandler(async (req, res) => {
    // Aacha now when we want to go to a channel, we are navigated to the page via url. Suppose you want to visit the page CAC, so now your url will
    // be http://localhost:8000/api/v1/users/channel/CAC (this one is tried & tested). So here we will retrive which channel we want to go not via 
    // 'req.body' but via 'req.params' (i.e. the info encoded in our url) and for this reason only we have used 'app.use(express.urlencoded())' in our app.js

    const {username}= req.params

    if(!username?.trim())       // Understand this part bahaut muskil ni h
    {
        throw new ApiError(400, "Username is missing")
    }

    // yh pipelines ek baar aache se samj lena (pura course krne ka jarurat ni h just ek basic understanding rakhna)
    const channel= await User.aggregate([
        {
            $match: {       // Basically this line is saying, find that entry from the database where 'username' is 'username.toLowerCase()'. 2nd waala username url se mila h and 1st waala database ka h
                username: username.toLowerCase()
            }
        },

        {
            $lookup: {      // 'lookup' is like 'join' in mySQL. Now since we are performing the pipeline in User table, so it has automatically taken our 1st table as User
                from: "subscriptions",  // this is our 2nd table. now we know that in mongoose, if the table name (given by us) is 'Subscription', then in database it will become 'subscriptions'. So we had given the name accordingly 
                localField: "_id",      // Column name from the 1st table
                foreignField: "channel",   // Column name from the 2nd table
                as: "subscribers"       // By which name we want to use this data further in our pipeline
            }
        }, 

        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"  // dekho yha pe thoda naam ulta de diya h 'subscribers' k jgh 'subscribedTo' hoga and vice-versa. But for the timing hm aise hi chla lete h
            }
        },

        {
            $addFields: {       // in this we can define some custom fields 
                subscribersCount: {
                    $size: "$subscribers"       // '$size' is same as 'count()' in mySQl
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"      // Now since 'subscribers' and 'subscribedTo' are fileds now, we are giving a $ sign before their name
                }, 
                isSubscribed: {     // this column will show that the channel the user is visiting, is susbcribed by the user itself or not
                    $cond: {        // Conditional sattement
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},       // Will give the condition here
                            // The above line says that check if the _id of the currnt user (got by req.user) is present in 'subscriber' sub-column of 'subscribers' column. Ab samj jaao.
                        then: true,     // if the condition is true, then assign 'isSubscribed= true'
                        else: false      // if the condition is false, then assign 'isSubscribed= false'
                    }
                }
            }
        },

        {
            $project: {     // using this we'll specify the fields which we want to get in our final output (as we don't want all of them)
                fullName: 1,        // It's like a flag here: 1 for true, 0 for false
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,      // we can write 1 here or simply we just don't write this field as default is 1 (same for all fields with value 1)
                // password: 0,     // But note that in '$project' either we can Include the fields you want (with 1), or Exclude the fields you don't want (with 0). You cannot do both at the same time
                email: 1,
                // refreshToken: 0
            }
        }
    ])  // Ask in chatGPT to show with an example hwo the fianl output will look like. Then you'll properly understand


    if(!channel?.length)
    {
        throw new ApiError(404, "Channel does not exists")
    }

    console.log(channel)        // Note: 'channel' is an array of objects (we can have multiple objects in this array but for this case we have only one)


    return res.status(200)
              .json(new ApiResponse(200,
                                    channel[0],
                                    `Channel ${channel[0].username} fetched successfully`))
})








const getWatchHistory= asyncHandler(async (req, res) => {

    // yh wala aggregation pipeline ek baar samj lena, hard ni h bss thoda in-depth h. Or ek baar lecture 21 hi dekhlo samj jaaogi
    const user= await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)      // Why are writing like this instead of just 'req.user._id'. Now for the answer refer to video lecture 21 from 5.00 to 8.00 timestamp. It's interesting
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",     // will overwrite our 'watchHistory' field. I.e. jo 'whatchHistory' field mei phle sirf '_id' th, usme ab uss '_id' ka reference waale video ka pura detail hoga
                pipeline: [     // creating a sub-pipeline for our new 'watchHistory' column
                    {
                        $lookup: {      // Creating a 'sub-join' inside this bigger 'join'
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner", 
                            pipeline: [     // Creating a sub-pipeline for our new 'owner' field
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                        // password: 0,
                                        // refreshToken: 0
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"        // get the first element of this 'owner' field as the 'owner' field is an array of objects, and in our case it has only one element in it
                            }
                        }
                    }
                ]
                // , pipeline: [.....]      // We can also write multiple pipelines for the same field like this, or we can create a nested pipeline as we had done above
            }
        }
    ])      // Ask gpt to give an example of what the output will look like

    console.log("\nYour entire user details is ", user)
    console.log("\n\nAnd just your user's watch history is ", user, "\n\n")

    return res.status(200)
              .json(new ApiResponse(200,
                                    user[0].watchHistory,   // Bekar mei pura user info bhjne k jgh hmlog uska sirf watch history hi bhjre h (and eventually that's what needed)
                                    `Watch history of ${user[0].username} fetched successfully`                      
                                   ))
})






const deleteUser= asyncHandler(async (req, res) => {
    const user= req.user


    // Deleting the avatar and coverImage from cloudinary as well
    const avatarPublicIdMatch = user.avatar.match(/\/([^/]+)\.[a-zA-Z]+$/);
    if (avatarPublicIdMatch && avatarPublicIdMatch[1]) {
        const avatarPublicId = avatarPublicIdMatch[1];
        const deletedAvatarFromCloudinary = await deleteFromCloudinary(avatarPublicId, 'image');
        if (!deletedAvatarFromCloudinary) {
            throw new ApiError(500, "Error deleting avatar from Cloudinary");
        }
    }

    if(user.coverImage)    // coverImage is a non-compulsary field so we are checking if it's present or not
    {
        const coverImagePublicIdMatch = user.coverImage.match(/\/([^/]+)\.[a-zA-Z]+$/);
        if (coverImagePublicIdMatch && coverImagePublicIdMatch[1]) {
            const coverImagePublicId = coverImagePublicIdMatch[1];
            const deletedCoverImageFromCloudinary = await deleteFromCloudinary(coverImagePublicId, 'image');
            if (!deletedCoverImageFromCloudinary) {
                throw new ApiError(500, "Error deleting cover image from Cloudinary");
            }
        }
    }

    const response= await User.findByIdAndDelete(user._id)

    if(!response)
    {
        throw new ApiError(500, "Error while deleting the user")
    }

    return res.status(200)
              .clearCookie("accessToken")
              .clearCookie("refreshToken")
              .json(new ApiResponse(200,
                                    response,
                                    "User deleted successfully"))
})


const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const user= await User.findById(userId).select("-password -refreshToken")

    if(!user)
    {
        throw new ApiError(404, "User not found")
    }

    return res.status(200)
              .json(new ApiResponse(200,
                                    user,
                                    "User fetched successfully"))
})



export {registerUser, loginUser, logoutUser, getWatchHistory,        // Since asyncHandler is returning a function, so registerdUser is also a function
    changeCurrentPassword, getCurrentUser, updateAccountDetails,
    updateUserAvatar, updateUserCoverImage, getUserChannelProfile, 
    deleteUser, getUserById}