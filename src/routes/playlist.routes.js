import { Router } from "express";
import * as playlistController from "../controllers/playlist.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const playlistRouter= Router()

playlistRouter.route("/createPlaylist").post(verifyJWT, upload.none(), playlistController.createPlaylist)

playlistRouter.route("/:playlistId/addVideoToPlaylist").put(verifyJWT, upload.fields([{ name: "videoFile", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), playlistController.AddVideoToPlaylist)

playlistRouter.route("/:playlistId/removeVideoFromPlaylist/:videoId").delete(verifyJWT, upload.none(), playlistController.removeVideoFromPlaylist)

playlistRouter.route("/getPlaylist/:playlistId").get(upload.none(), playlistController.getPlaylistById)

playlistRouter.route("/getAllPlaylistsOfUser/:userId").get(upload.none(), playlistController.getAllPlaylistsOfUser)

playlistRouter.route("/:playlistId/deletePlaylist").delete(verifyJWT, upload.none(), playlistController.deletePlaylist)

playlistRouter.route("/:playlistId/updatePlaylist").patch(verifyJWT, upload.none(), playlistController.updatePlaylist)



export default playlistRouter