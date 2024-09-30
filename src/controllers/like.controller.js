import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Like.findOne({ video: videoId, owner: req.user?._id });
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
})

const getLikedVideos = asyncHandler(async (req, res) => {

})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}

