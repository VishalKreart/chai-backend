import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadFileOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: "Paani aur code"
    // })

    /* 
    1.  recieve data from user
    2.  validate data 
    3.  check if user is already registered (check using username and email id)if yes then send it login page
    4.  check for images, check for avatars
    5.  upload them to cloudinary, avatar
    6.  create user object - create entry in db
    7.  remove password and refrsh token  field from response
    8.  check for user creation
    9.  return res
    */

    //1)
    const { username, fullName, email, password } = req.body;
    // console.log(`username: ${username} and email: ${email}`);
    //2)
    if ([username, fullName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    //3)
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "Username with email or username is alredy exists");
    }
    //4)
    // console.log(req);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError("400", "Avatar file is required");
    }

    //5)
    const avatar = await uploadFileOnCloudinary(avatarLocalPath);
    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError("400", "Avatar file is required");
    }
    //6)
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError("500", "Something went wrong while registering user");
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User successfully registered")
    )
})

export { registerUser }