import mongoose from 'mongoose'
import jwt from "jsonwebtoken"      // Used to generate tokens. Tokens are generally generated only for users (when they logs in), so we need to generate tokens only here 
import bcrypt from "bcrypt"     // used to encrypt values (generally passwords)

const userSchema= new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,       // will store a cloudinary url
        required: true
    },
    coverImage: {
        type: String
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,            // Will not store the password directly, but in encrypted form which will be encrypted by us only
        required: [true, "Password is required"]        // If the password is missing, then Mongoose will throw this validation error "Password is required"
    }, 
    refreshToken: {
        type: String
    }
}, {timestamps: true})


// 'pre' is a middleware provided by mongoose to perform some action before saving, updating, creating, etc. information to our database. In this case, we are encrypting our password before saving it to our database
userSchema.pre("save", async function(next) {       // Here don't define your function using arrow function () => {}, define it like this way only coz arrow functions do NOT have their own 'this'
    if(this.isModified("password") == true)         // 'isModified' is a built-in feature to check if the mentioned column has been modified/given_value_to_it or not
    {
        this.password= await bcrypt.hash(this.password, 10)       // 'bcrypt.hash' is used to encrypt our password here. Here, 10 is the number of rounds of encryption we want to apply to our password. We can give any number here
    }
    next()      // IMPORTANT to write this. It indicates that this part is done, flag it to be 'true' and move to the next part
})      


// Now, mongoose provides some built-in methods for our schemas like save, remove, validate, find, etc. Apart from these methods, we can also define some of our custom methods using 'userSchema.methods' like this,
userSchema.methods.isPasswordCorrect = async function (enteredPassword) {          // this function will be required when user logs in, to check whether the password he is using to log-in is correct or not.
    return await bcrypt.compare(enteredPassword, this.password)      // 'bcrypt.comapre' checks whether the entered password (after performing all encrytion to it) is equal to the password (encrypted waala) stored in our database or not. Returns a boolean value
}

// NOTE: All the new methods defined under '.methods' of any schema can be called only on the pre-existing user entry and not at the time of new user creation. After the new user has been created, this function can be called on the exsiting user by   'user_instance.new_method_name()' 
userSchema.methods.generateAccessToken = function () {
    const access_token= jwt.sign(       // Used to generate token
        {       // Payloads. In this we will define what are the information we want our token to store in it
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,            // ACCESS_TOKEN_SECRET is nothing but the secret key for our access token
        {
            //  (Ctrl + space_bar)  dabane se you will get suggestions of what more you can add here
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            algorithm: 'HS256'          // check for more algorithms that you can apply here
        }
    )      

    return access_token
}       


userSchema.methods.generateRefreshToken = function () {
    const refresh_token= jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY,
            algorithm: 'HS256'
        }
    )

    return refresh_token
}

// Access_token and refresh_token are basically the same bss unka use cases alg h wo hm aage padhenge. Also some prominent differnce between
// both of them is that access_token generally store more info in it and refresh_token stores comparitively less info in it. access_token has 
// a very small expiry like 1 day or 2 day or few hours, but the refresh_token has a higher expiry like 10 days.


export const User= mongoose.model("User", userSchema)