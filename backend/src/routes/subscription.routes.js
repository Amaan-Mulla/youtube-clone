import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleSubscription, getChannelSubscriptionInfo, getMySubscriptions } from "../controllers/subscription.controller.js";

const router = Router();

router.route("/c/:channelId").post(
    verifyJWT,
    toggleSubscription
);

router.route("/c/:channelId").get(
    verifyJWT,
    getChannelSubscriptionInfo
);

router.route("/my-subscriptions").get(
    verifyJWT,
    getMySubscriptions
);

export default router;