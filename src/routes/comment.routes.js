import { Router } from "express";
import {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); //apply verifyJWT middleware to all routes


router.route("/:videoId")
    .get(getVideoComments).
    post(addComment);

router.route("/c/:commentId")
    .delete(deleteComment).
    patch(updateComment);

export default router



