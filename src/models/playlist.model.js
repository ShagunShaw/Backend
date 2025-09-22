import mongoose, { Schema } from "mongoose";

const playlistSchema= new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnail: {        // This thumbnail is nothing but the thumbnail of the first video in the playlist
        type: String,
        required: true
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})


export const Playlist= mongoose.model("Playlist", playlistSchema)