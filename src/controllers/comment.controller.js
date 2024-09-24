import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //get all comments form a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    const commentsOnVideo = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, commentsOnVideo, "Comments found successfully"));

})



const addComment = asyncHandler(async (req, res) => {
    //add comment to a video
    const { videoId } = req.params;
    const { content } = req.body;  //content is the comment text
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const newComment = await Comment.create({
        content,
        video: new mongoose.Types.ObjectId(videoId),
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })

    if (!newComment) {
        throw new ApiError(500, "Something went wrong while creating comment");
    }
    return res.status(200).json(new ApiResponse(200, newComment, "Comment created successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    //update comment
    const { commentId } = req.params;
    const { content } = req.body;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }
    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, {
        $set: {
            content
        }
    }, { new: true });

    if (!updatedComment) {
        throw new ApiError(500, "Something went wrong while updating comment");
    }
    return res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
    //delete comment
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }
    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    return res.status(200).json(new ApiResponse(200, comment, "Comment deleted successfully"));
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}