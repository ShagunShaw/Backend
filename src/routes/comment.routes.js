import { Router } from "express";
import * as commentController from "../controllers/comment.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const commentRouter= Router()

commentRouter.route("/addComment/:videoId").post(verifyJWT, upload.none(), commentController.addCommentOnVideo)   // Here, we are using 'upload.none()' coz we are not uploading any file here, we are just sending some text data i.e. comment

commentRouter.route("/getComments/:videoId").get(upload.none(), commentController.getAllCommentsOfVideo)    // Here we are not using verifyJWT so that even a non-logged in user can see the comments on a video, which is possible on youtube also

commentRouter.route("/editComment/:commentId/:videoId").patch(verifyJWT, upload.none(), commentController.editComment)

commentRouter.route("/deleteComment/:commentId/:videoId").delete(verifyJWT, upload.none(), commentController.deleteComment)


export default commentRouter