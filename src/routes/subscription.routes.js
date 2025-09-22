import {  Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller.js';
import { verifyJWt } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const subscriptionRouter= Router();


subscriptionRouter.route("/:userId/subscribe").put(verifyJWt, upload.none(), subscriptionController.subscribeToChannel);


subscriptionRouter.route("/:userId/unsubscribe").delete(verifyJWt, upload.none(), subscriptionController.unsubscribeFromChannel);


subscriptionRouter.route("/getSubscriptions").get(verifyJWt, upload.none(), subscriptionController.getAllSubscriptions);


subscriptionRouter.route("/getSubscribers").get(verifyJWt, upload.none(), subscriptionController.getAllSubscribersAndTheirCount);


subscriptionRouter.route("/:userId/isSubscribed").get(verifyJWt, upload.none(), subscriptionController.isSubscribed);


export default subscriptionRouter;