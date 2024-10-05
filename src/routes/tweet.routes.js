import { Router } from "express";

import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); //apply verifyJWT middleware to all routes

router.route("/").post(createTweet);
router.route("/:userId").get(getUserTweets);
router.route("/:tweetId")
    .patch(updateTweet)
    .delete(deleteTweet);

export default router;