import { Router } from "express";
import * as tweetController from "../controllers/tweet.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const tweetRouter = Router();

tweetRouter.route("/createTweet").post(verifyJWT, upload.single("image"), tweetController.createTweet);

tweetRouter.route("/getAllTweetsByID/:userId").get(upload.none(), tweetController.getAllTweetsByID);

tweetRouter.route("/getMyTweets").get(verifyJWT, upload.none(), tweetController.getAllTweetsOfUser);

tweetRouter.route("/:tweetId/updateTweet").patch(verifyJWT, upload.single("image"), tweetController.updateTweetByID);

tweetRouter.route("/:tweetId/deleteTweet").delete(verifyJWT, upload.none(), tweetController.deleteTweetByID);

export default tweetRouter;