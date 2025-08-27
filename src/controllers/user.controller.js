import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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







    const user= await User.create({         // Now our entry has been added to our database
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
    // await user.save() 









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


export {registerUser}           // Since asyncHandler is retuning a function, so registerdUser is also a function