import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";



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





const generateAccessAndRefreshTokens= async (userId) => {
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


    // if(!req.body)
    // {
    //     console.log(req.body ,"\n\n")
    //     throw new ApiError(500, "req.body is undefined")
    // }
    const {email, username, password}= req.body       // Between username and email, the user can give only one

    // Now between username and email, it's compulsory that we need one. It cannot be that user ne username and email dono hi ni diya
    if(!username  &&  !email)
    {
        throw new ApiError(400, "username or email is required. Koi ek toh do")
    }





    const user= await User.findOne({
        $or: [{username}, {email}]      // i.e. agr username h toh uss basis mei user find krdo, else agr email h toh uss basis pe user find krdo
    })

    if(!user)
    {
        throw new ApiError(404, "User does not exist")
    }









    const isPasswordValid= user.isPasswordCorrect(password)     // tutorial mei yha prr bhi ek await lagaya, but I dont think it's needed. Dekh lena ek baar
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
        secure: true       // development k time isko false krr dena, production k time isko true krr dena. This is because development k time pe hamara url http hota h and not https, so agr isme secure: true krr denge toh yh hamare cookies ko allow ni karega    
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





export {registerUser, loginUser, logoutUser}           // Since asyncHandler is returning a function, so registerdUser is also a function