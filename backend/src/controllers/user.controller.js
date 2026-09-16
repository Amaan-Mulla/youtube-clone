import {asyncHandler } from '../utils/asyncHandler.js'; // Import the asyncHandler function from the utils/asyncHandler.js file
import { APIError } from '../utils/APIError.js';// Import the APIError class from the utils/APIError.js file
import { User } from '../models/user.model.js'; // Import the User model from the models/user.model.js file
import { uploadCloudinary } from '../utils/cloudinary.js'; // Import the uploadToCloudinary function from the utils/cloudinary.js file
import { ApiResponse } from '../utils/ApiResponse.js'; // Import the ApiResponse class from the utils/ApiResponse.js file
import jwt from 'jsonwebtoken'; // Import the jsonwebtoken library for generating and verifying JWT tokens
import mongoose from "mongoose";

const isProduction = process.env.NODE_ENV === "production";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId); // Find the
        const accessToken = user.generateAccessToken(); // Generate an access token for the user
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken; // Set the refresh token for the user
        await user.save({ validateBeforeSave: false }); // Save the user with the new refresh token
        
        return { accessToken, refreshToken }; // Return the access and refresh tokens

    } catch (error) {
        throw new APIError(500, "Error while generating access and refresh token");
    }
}



const registerUser = asyncHandler( async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists : username , email
    // check for imges, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from respose
    // check for user creation
    // return res

    const { username, email, fullName, password } = req.body || {}; // get the username, email, fullName, and password from the request body
    
    // console.log(req.body);

    // validation - not empty
    if(!fullName) {
        throw new APIError(400, "Full name is required");
    }
    if(!username) {
        throw new APIError(400, "Username is required");
    }   
    if(!email) {
        throw new APIError(400, "Email is required");
    }
    if(!password) {
        throw new APIError(400, "Password is required");
    }

    // check if user already exists : username , email
    const existingUser = await User.findOne({
        $or: [{username}, {email}] // $or operator is used to check if either the username or email already exists in the database
    });

    if(existingUser) {
        throw new APIError(409, "User with email or username already exists");
    }

    // check for images, check for avatar
    const avatarLocalpath = req.files?.avatar?.[0]?.path;
    const coverImageLocalpath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalpath) {
        throw new APIError(400, "Avatar is required");
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadCloudinary(avatarLocalpath); // upload the avatar file to Cloudinary and get the response
    const coverImage = await uploadCloudinary(coverImageLocalpath); // upload the cover image file to Cloudinary and get the response

    if(!avatar) {
        throw new APIError(500, "Avatar upload failed");
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url, // set the avatar field to the URL of the uploaded avatar file
        coverImage: coverImage?.url || "" // set the coverImage field to the URL of the uploaded cover image file, or an empty string if no cover image was uploaded
    })
    // remove password and refresh token field from respose
    const createdUser = await User.findById(user._id).select("-password -refreshToken"); // find the created user by ID and exclude the password and refreshToken fields from the response

    // check for user creation
    if(!createdUser) {
        throw new APIError(500, "User creation failed");
    }

    return res.status(201).json(
        new ApiResponse(201, "User created successfully",createdUser) // return a success response with the created user object
    )
})

const loginUser = asyncHandler( async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password match
    // generate access and refresh token
    // send cookie

    const {email, username, password} = req.body;

    if(!(email || username)) {
        throw new APIError(400, "Email or username is required");
    }
    if(!password) {
        throw new APIError(400, "Password is required");
    }
    const user = await User.findOne({
        $or: [{email}, {username}] // find the user by email or username
    })

    // user contains the user object if found, otherwise it will be null. 
    // If the user is not found, throw an error with status code 404 and message "User not found"
    if(!user) {
        throw new APIError(404, "User not found");
    }

    // compare the provided password with the hashed password in the database
    // isPasswordValid will be true if the passwords match, false otherwise
    const isPasswordValid = await user.comparePassword(password); 
    

    if(!isPasswordValid) {
        throw new APIError(401, "Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken"); // find the logged in user by ID and exclude the password and refreshToken fields from the response

    const cookieOptions = {
        httpOnly: true, // cookie cannot be accessed by client-side JavaScript
        secure: isProduction
    }

    // send the access and refresh tokens as cookies in the response, along with the logged in user object to the broser(client)
    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(
            200,
            "User logged in successfully",
            {
                user: loggedInUser
            }
             
        )  
    )
})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { 
            $set: { 
                refreshToken: null // set the refresh token to null in the database to invalidate it
            }
        },
            {
                returnDocument: "after" // return the updated document after the update operation
            }
        ) 
        const cookieOptions = {
            httpOnly: true, // cookie cannot be accessed by client-side JavaScript
            secure: isProduction,
        }  
        
    return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(
        new ApiResponse(
            200,
            "User logged out successfully",
            null,
        )
    )
}); 


const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.
    refreshToken || req.body?.refreshToken; // get the refresh token from the request cookies or body

    if(!incomingRefreshToken) {
        throw new APIError(401, "Refresh token is required");
    }
    let decodedToken;
    try {
            decodedToken = jwt.verify(
            incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
        )
    } catch (error) {
        throw new APIError(401, "Invalid or expired refresh token");
    }

        const user = await User.findById(decodedToken?._id); // find the user by ID from the decoded token
        if(!user) {
            throw new APIError(401, "Invalid refresh token");

        }

        if(incomingRefreshToken !== user?.refreshToken) {
            throw new APIError(401, "Invalid refresh token");
        }

        const cookiesOptions = {
            httpOnly: true, // cookie cannot be accessed by client-side JavaScript
            secure: isProduction, // cookie will only be sent over HTTPS in production
        }

        // generate new access and refresh tokens for the user
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
        .status(200)
        .cookie("accessToken", accessToken, cookiesOptions)
        .cookie("refreshToken", refreshToken, cookiesOptions)
        .json(
            new ApiResponse(
                200,
                "Access token refreshed successfully",
                    null
                
            )   
        )

});


const changeCurrentPassword = asyncHandler( async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if(!currentPassword) {
        throw new APIError(400, "Current password is required");
    }
    if(!newPassword) {
        throw new APIError(400, "New password is required");
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if(!isPasswordCorrect) {
        throw new APIError(401, "Current password is incorrect");
    }

    const isNewPasswordSame = await user.comparePassword(newPassword);

    if(isNewPasswordSame) {
        throw new APIError(
            400,
            "New password must be different from current password"
        );
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Password changed successfully",
            {}
           
        )
    );
});


const getCurrentUser = asyncHandler( async (req, res) => {
    const currentUser = await User.findById(req.user._id)
        .select("-password -refreshToken");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Current user fetched successfully",
            currentUser
            
        )
    );
});


const updateAccountDetails = asyncHandler( async (req, res) => {
    const { fullName, email } = req.body;

    if(!fullName || !email) {   
        throw new APIError(400, "Full name and email are required");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Account details updated successfully",
            updatedUser
            
        )
    );
});



const updateUserAvatar = asyncHandler( async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath) {
        throw new APIError(400, "Avatar is required");
    }

    const avatar = await uploadCloudinary(avatarLocalPath);

    if(!avatar.url) {
        throw new APIError(500, "Avatar upload failed");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            
            "Avatar updated successfully",
            updatedUser
        )
    );
});




const updateUserCoverImage = asyncHandler( async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath) {
        throw new APIError(400, "Cover image is required");
    }

    const coverImage = await uploadCloudinary(coverImageLocalPath);

    if(!coverImage.url) {
        throw new APIError(500, "Cover image upload failed");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Cover image updated successfully",
            updatedUser
            
        )
    );
});


const getUserChannelProfile = asyncHandler( async (req, res) => {
    const { username} = req.params;

    if(!username?.trim()) {
        throw new APIError(400, "Username is required");
    }    
     
    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        // Who subscribed TO Aman?
        //foreignField: "channel"
        {
            $lookup: {
                from : "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        // Whom did Aman subscribe TO?
        //foreignField: "subscriber"
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                subscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                
            }
        }

    ])

    if(!channel?.length) {
        throw new APIError(404, "Channel not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Channel profile fetched successfully",
            channel[0]
           
        )
    );

})






export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    
}; // Export the registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, and updateCoverImage functions so they can be used in other parts of the application
