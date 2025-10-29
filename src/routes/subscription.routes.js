import {  Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const subscriptionRouter= Router();

subscriptionRouter.use(verifyJWT, upload.none());   // Since these two fields will be required in all routes, so instead of adding them in each route individually, we are adding them here at once


subscriptionRouter.route("/toggleSubscription/:userId").post(subscriptionController.toggleSubscription);


subscriptionRouter.route("/getSubscriptions").get(subscriptionController.getAllSubscriptions);


subscriptionRouter.route("/getSubscribers").get(subscriptionController.getAllSubscribersAndTheirCount);


subscriptionRouter.route("/:userId/isSubscribed").get(subscriptionController.isSubscribed);


export default subscriptionRouter;