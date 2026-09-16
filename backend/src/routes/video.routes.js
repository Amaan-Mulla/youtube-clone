import { Router } from "express";
import { getAllVideos, publishVideo, getVideoById, togglePublishVideo, deleteVideo, updateVideo, watchVideo, getAllVideosAdvanced,
    getChannelVideos,
    getChannelStats,
    getMyVideos
 } from "../controllers/video.controller.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(getAllVideos);

router.route("/advanced")
    .get(
        verifyJWT,
        getAllVideosAdvanced
    );

router.route("/my-videos")
    .get(
        verifyJWT,
        getMyVideos
    );

router.route("/channel/:userId")
    .get(getChannelVideos);

router.route("/channel/:userId/stats")
    .get(getChannelStats);

router.route("/:videoId")
    .get(optionalVerifyJWT, getVideoById);




router.route("/").post(
    verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishVideo
);


router.route("/:videoId/toggle-publish").patch(
    verifyJWT,
    togglePublishVideo
);

router.route("/:videoId").delete(
    verifyJWT,
    deleteVideo
);

router.route("/:videoId").patch(
    verifyJWT,
    upload.single("thumbnail"),
    updateVideo
);




router.route("/:videoId/watch").post(
    verifyJWT,
    watchVideo
);



export default router;
