import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadFileOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {

    //TODO: get all videos based on query, sort, pagination
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

})

const publishVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description } = req.body;
    const videoFileLocalPath = req.files?.video[0]?.path;
    const thumbnailFileLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoFileLocalPath || !thumbnailFileLocalPath) {
        throw new ApiError(400, "Video or thumbnail files not found")
    }

    const video = await uploadFileOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadFileOnCloudinary(thumbnailFileLocalPath);

    if (!video || !thumbnail) {
        throw new ApiError(500, "Something went wrong while uploading video or thumbnail");
    }
    console.log(video);
    const newVideo = await Video.create({
        name: title,
        description,
        videoFile: video.url,
        thumbNail: thumbnail.url,
        duration: video.duration
    })

    const createdNewVideo = await Video.findById(newVideo._id);
    if (!createdNewVideo) {
        throw new ApiError(500, "Something went wrong while creating video");
    }

    return res.status(201)
        .json(new ApiResponse(201, createdNewVideo, "Video uploaded successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(new ApiResponse(200, video, "Video found successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params;
    const { name, description } = req.body;

    const thumbnailLocalPath = req.file?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file not found")
    }

    const thumbnail = await uploadFileOnCloudinary(thumbnailLocalPath);

    if (!thumbnail.url) {
        throw new ApiError(500, "Something went wrong while uploading thumbnail");
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId, {
        $set: {
            name,
            description,
            thumbNail: thumbnail.url
        }
    }, { new: true });

    return res.status(200).json(new ApiResponse(200, updatedVideo, "Video info updated successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    const { videoId } = req.params;
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    //TODO: toggle publish status
    const { videoId } = req.params;


})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}