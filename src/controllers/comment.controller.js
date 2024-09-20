import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //get all comments form a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

})


const addComment = asyncHandler(async (req, res) => {
    //add comment to a video
    const { videoId } = req.params;
    const { content } = req.body;  //content is the comment text
})

const updateComment = asyncHandler(async (req, res) => {
    //update comment
    const { commentId } = req.params;
    const { content } = req.body;
})

const deleteComment = asyncHandler(async (req, res) => {
    //delete comment
    const { commentId } = req.params;
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}