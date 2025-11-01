import { Router } from "express";
import * as likeController from "../controllers/like.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const likeRouter = Router();

likeRouter.use(upload.none());      // Since upload.none() was used in every like controller, so instead of writing it every time, we write it here at once only

likeRouter.route("/toggleCommentLike/:commentId").post(verifyJWT, likeController.toggleLikeOnComment);
likeRouter.route("/toggleVideoLike/:videoId").post(verifyJWT, likeController.toggleLikeOnVideo);
likeRouter.route("/toggleTweetLike/:tweetId").post(verifyJWT, likeController.toggleLikeOnTweet);

likeRouter.route("/isCommentLiked/:commentId").get(verifyJWT, likeController.isCommentLikedByUser);
likeRouter.route("/isVideoLiked/:videoId").get(verifyJWT, likeController.isVideoLikedByUser);
likeRouter.route("/isTweetLiked/:tweetId").get(verifyJWT, likeController.isTweetLikedByUser);

likeRouter.route("/getCommentLikes/:commentId").get(likeController.likeCountOnComment);
likeRouter.route("/getVideoLikes/:videoId").get(likeController.likeCountOnVideo);
likeRouter.route("/getTweetLikes/:tweetId").get(likeController.likeCountOnTweet);

likeRouter.route("/videos").get(verifyJWT, likeController.getLikedVideos);

export default likeRouter;