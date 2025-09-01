import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema({
    subscriber: {           // check this part, yha I think ek array hoga instead of {}
                            // Nope, yha pe array ni hoga; isko purposely {} banaya h. To understand how it works, check lecture no. 19
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"         // Channel bhi toh ek User hi h
    }
}, {timestamps: true})


export const Subscription= mongoose.model("Subscription", subscriptionSchema)