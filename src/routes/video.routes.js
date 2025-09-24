import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import * as videoController from "../controllers/video.controller.js";

const videoRouter= Router();


// Yh wala agr kbhi possible ho toh ai use krke iska controller daal dena
videoRouter.route("/get-recommended").get(upload.none(), videoController.getVideosByRecommendation)  


videoRouter.route("/get-videos-of-user/:userId").get(upload.none(), videoController.getAllVideosOfUser)


videoRouter.route("/get-video/:videoId").get(upload.none(), videoController.getVideoById)


videoRouter.route("/upload-video").put(verifyJWT, upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), videoController.uploadVideo)


videoRouter.route("/delete-video/:videoId").delete(verifyJWT, upload.none(), videoController.deleteVideoById)


videoRouter.route("/update-video-metadata/:videoId").patch(verifyJWT, upload.single('thumbnail'), videoController.updateVideoById)


export default videoRouter;