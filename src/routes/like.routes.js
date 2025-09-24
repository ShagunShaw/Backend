import { Router } from "express";
import * as likeController from "../controllers/like.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const likeRouter = Router();


likeRouter.route("/likeComment/:commentId").post(verifyJWT, upload.none(), likeController.createLikeOnComment);
likeRouter.route("/likeVideo/:videoId").post(verifyJWT, upload.none(), likeController.createLikeOnVideo);
likeRouter.route("/likeTweet/:tweetId").post(verifyJWT, upload.none(), likeController.createLikeOnTweet);

likeRouter.route("/isCommentLiked/:commentId").get(verifyJWT, upload.none(), likeController.isCommentLikedByUser);
likeRouter.route("/isVideoLiked/:videoId").get(verifyJWT, upload.none(), likeController.isVideoLikedByUser);
likeRouter.route("/isTweetLiked/:tweetId").get(verifyJWT, upload.none(), likeController.isTweetLikedByUser);

likeRouter.route("/removeLikeOnComment/:commentId").delete(verifyJWT, upload.none(), likeController.removeLikeOnComment);
likeRouter.route("/removeLikeOnVideo/:videoId").delete(verifyJWT, upload.none(), likeController.removeLikeOnVideo);
likeRouter.route("/removeLikeOnTweet/:tweetId").delete(verifyJWT, upload.none(), likeController.removeLikeOnTweet);

likeRouter.route("/getCommentLikes/:commentId").get(upload.none(), likeController.likeCountOnComment);
likeRouter.route("/getVideoLikes/:videoId").get(upload.none(), likeController.likeCountOnVideo);
likeRouter.route("/getTweetLikes/:tweetId").get(upload.none(), likeController.likeCountOnTweet);


export default likeRouter;