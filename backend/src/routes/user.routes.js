import { Router } from "express";
import {
     registerUser,
     loginUser,
     logoutUser,
     refreshAccessToken,
     changeCurrentPassword,
     getCurrentUser,
     updateAccountDetails, updateUserAvatar, updateUserCoverImage,
     getUserChannelProfile
    } from "../controllers/user.controller.js"; // Import the registerUser function from the controllers/user.controller.js file

import { upload } from "../middlewares/multer.middleware.js"; // Import the upload middleware from the middlewares/multer.middleware.js file

import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js"; // Import the verifyJWT middleware from the middlewares/auth.middleware.js file

const router = Router();

router.route("/register").post(
    upload.fields([ // Use the upload middleware to handle file uploads for the /register route
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser); // Define a POST route for /register that calls the registerUser function 


router.route("/login").post(loginUser); // Define a POST route for /login that calls the loginUser function

//secured routes
router.route("/logout").post(verifyJWT, logoutUser); // Define a POST route for /logout that calls the logoutUser function
router.route("/refresh-token").post(refreshAccessToken); // Define a POST route for /refresh-token that calls the refreshAccessToken function
router.route("/change-password").post(verifyJWT, changeCurrentPassword); // Define a POST route for /change-password that calls the changeCurrentPassword function

router.route("/current-user").get(verifyJWT, getCurrentUser); // Define a GET route for /current-user that calls the getCurrentUser function
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails);

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar); // Define a PATCH route for /update-avatar that calls the updateAvatar function
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage); // Define a PATCH route for /update-cover-image that calls the updateCoverImage function

router.route("/channel/:username").get(optionalVerifyJWT, getUserChannelProfile); // Define a GET route for /channel/:username that calls the getUserChannelProfile function

export default router;
