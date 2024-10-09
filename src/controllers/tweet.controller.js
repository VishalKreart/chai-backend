import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
    console.log(content);
    // if (!content) {
    //     throw new ApiError(400, "Content is required");
    // }
    const newTweet = await Tweet.create({
        content,
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })

    if (!newTweet) {
        throw new ApiError(500, "Something went wrong while creating tweet");
    }
    return res.status(200).json(new ApiResponse(200, newTweet, "Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const tweets = await Tweet.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "tweet",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    totalLikes: { $size: "$likes" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                avatar: 1,
                                fullName: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$owner"
            },
            {
                $project: {
                    content: 1,
                    totalLikes: 1,
                    owner: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isLiked: {
                        $cond: {
                            if: {
                                $in: [req.user?._id, "$likes"],
                            },
                            then: true,
                            else: false,
                        },
                    },
                }
            }
        ]
    )

    if (!tweets) {
        throw new ApiError(500, "Something went wrong while getting tweets");
    }
    return res.status(200).json(new ApiResponse(200, tweets, "Tweets retrieved successfully"));

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }
    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, {
        $set: {
            content
        }
    }, { new: true });

    if (!updatedTweet) {
        throw new ApiError(500, "Something went wrong while updating tweet");
    }
    return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }
    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if (!tweet) {
        throw new ApiError(500, "Something went wrong while deleting tweet");
    }
    return res.status(200).json(new ApiResponse(200, tweet, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}