import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const like = await Like.findOne({ video: videoId, likedBy: req.user?._id });

    if (like) {
        await Like.findByIdAndDelete(like._id)
    } else {
        const newLike = await Like.create({
            video: new mongoose.Types.ObjectId(videoId),
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
        })
    }

    return res.status(200).json(new ApiResponse(200, null, "Like toggled successfully"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const like = await Like.findOne({ comment: commentId, likedBy: req.user?._id });

    if (like) {
        await Like.findByIdAndDelete(like._id)
    } else {
        const newLike = await Like.create({
            comment: new mongoose.Types.ObjectId(commentId),
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
        })
    }

    return res.status(200).json(new ApiResponse(200, null, "Like on commnet toggled successfully"));
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const like = await Like.findOne({ tweet: tweetId, likedBy: req.user?._id });

    if (like) {
        await Like.findByIdAndDelete(like._id)
    } else {
        const newLike = await Like.create({
            tweet: new mongoose.Types.ObjectId(tweetId),
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
        })
    }
    return res.status(200).json(new ApiResponse(200, null, "Like on tweet toggled successfully"));
})

const getLikedVideos = asyncHandler(async (req, res) => {

    const likedVideo = await Like.aggregate([
        {
            $match: {
                video: { $ne: null },
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ]
                        }
                    },
                    {
                        $unwind: "$owner"
                    }
                ]
            }
        },
        {
            $unwind: "$video"
        },
        {
            $match: {
                "video.isPublished": true
            }
        },
        {
            $group: {
                _id: "likedBy",
                videos: { $push: "$video" }
            }
        }
    ])
    // console.log(likedVideo);
    const videos = likedVideo[0]?.videos || [];
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos sent successfully"));

})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}

