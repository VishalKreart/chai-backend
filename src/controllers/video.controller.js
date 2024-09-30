import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadFileOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {

    //TODO: get all videos based on query, sort, pagination
    const { page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = "desc",
        userId = "" } = req.query;

    const totalVideos = await Video.countDocuments({});
    const totalPages = Math.ceil(totalVideos / limit);
    const startPage = (page - 1) * limit;
    // console.log(totalVideos, totalPages, startPage);

    const videos = await Video.aggregate([

        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: {
                    $arrayElemAt: ["$owner", 0]
                }
            }
        },
        {
            $skip: startPage,
        },
        {
            $limit: parseInt(limit) //limit
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                videoFile: 1,
                thumbNail: 1,
                duration: 1,
                isPublished: 1,
                views: 1,
                owner: {
                    _id: 1,
                    username: 1,
                    fullName: 1
                }
            }
        }
    ])


    return res.status(200).json(new ApiResponse(200, videos, "Videos found successfully"));

})

const publishVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description } = req.body;

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailFileLocalPath = req.files?.thumbNail[0]?.path;

    if (!videoFileLocalPath || !thumbnailFileLocalPath) {
        throw new ApiError(400, "Video or thumbnail files not found")
    }

    const video = await uploadFileOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadFileOnCloudinary(thumbnailFileLocalPath);

    if (!video || !thumbnail) {
        throw new ApiError(500, "Something went wrong while uploading video or thumbnail");
    }
    console.log(video);
    const createdNewVideo = await Video.create({
        name: title,
        description,
        videoFile: video.url,
        thumbNail: thumbnail.url,
        duration: video?.duration,
        isPublished: true,
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })

    // const createdNewVideo = await Video.findById(newVideo._id);
    if (!createdNewVideo) {
        throw new ApiError(500, "Something went wrong while uploading video");
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

    if (!updatedVideo) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(new ApiResponse(200, updatedVideo, "Video info updated successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    const { videoId } = req.params;

    const video = await Video.findByIdAndDelete(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(new ApiResponse(200, video, "Video deleted successfully"));

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    //TODO: toggle publish status
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId, {
        $set: {
            isPublished: !video.isPublished
        }
    }, { new: true }).select(
        "-duration -views -owner -videoFile -thumbNail"
    );

    return res.status(200).json(new ApiResponse(200,
        updatedVideo,
        "Video published status updated successfully"));

})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}