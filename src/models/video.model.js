import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'      // It is nothing but a sort of plugin for our database

const videoSchema= new mongoose.Schema({
    videoFile: {        
        type: String,           // Cloudinary url
        required: true
    },
    thumbnail: {        // thumbnail is a small preview image that visually represents the video content and appears before the video is played. 
        type: String,           // Cloudinary url
        required: true
    }, 
    title: {        
        type: String,           
        required: true
    }, 
    description: {        
        type: String,           
        required: true
    }, 
    duration: {     // this information will not be given by our user, this info will be provided by our cloud service in which we will be saving our videos
        type: Number,           
        required: true
    }, 
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

videoSchema.plugin(mongooseAggregatePaginate)       // Understand this line later

export const Video= mongoose.model("Video", videoSchema)