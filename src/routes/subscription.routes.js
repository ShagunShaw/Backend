import {  Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const subscriptionRouter= Router();


subscriptionRouter.route("/:userId/subscribe").put(verifyJWT, upload.none(), subscriptionController.subscribeToChannel);


subscriptionRouter.route("/:userId/unsubscribe").delete(verifyJWT, upload.none(), subscriptionController.unsubscribeFromChannel);


subscriptionRouter.route("/getSubscriptions").get(verifyJWT, upload.none(), subscriptionController.getAllSubscriptions);


subscriptionRouter.route("/getSubscribers").get(verifyJWT, upload.none(), subscriptionController.getAllSubscribersAndTheirCount);


subscriptionRouter.route("/:userId/isSubscribed").get(verifyJWT, upload.none(), subscriptionController.isSubscribed);


export default subscriptionRouter;