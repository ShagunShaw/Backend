import mongoose, { Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'


const commentSchema= new Schema({     // We can also define 'Schema' like this, by importing it directly in our import statement
    content: {
        type: String,
        required: true      // Empty string thodi na post krr skte h commment mei
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"        // Jb type 'Schema.Types.ObjectId' ho, toh 'ref' dena compulsory h
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"        
    }
}, {timestamps: true})


commentSchema.plugin(mongooseAggregatePaginate)     // This is simple. when we have our lot of comment, we dont want all of them to be appeared at once, so we often see na some examples
            // when after scrolling down till the end, the comments stops coming and there it's written 'see more' or 'load more' and when we click on it more comments appears on the dropdown.
            // So bss this 'mongooseAggregatePaginate' does the same thing, it loads our comment to a certain limit at 1st instance and when the user clicks on 'load more', it loads more comments
            // (again to a certain limit) in the 2nd instance and then it goes like this


export const Comment= new mongoose.model("Comment", commentSchema)