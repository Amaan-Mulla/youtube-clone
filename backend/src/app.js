import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors({ // cors middleware to allow cross-origin requests 
    origin: "http://localhost:5173",// allow requests from this origin
    credentials: true, // allow cookies to be sent with requests
}))

app.use(express.json({limit: "16kb"})) // middleware to parse incoming JSON requests with a limit of 16kb
app.use(express.urlencoded({extended: true, limit: "16kb"})) // middleware to parse incoming URL-encoded requests with a limit of 16kb
app.use(express.static("public")) // middleware to serve static files from the "public" directory
app.use(cookieParser()) // middleware to parse cookies from incoming requests


//routes import
import userRouter from "./routes/user.routes.js"; // import the userRouter from the routes/user.routes.js file
import videoRouter from "./routes/video.routes.js"; // import the videoRouter from the routes/video.routes.js file
import commentRouter from "./routes/comment.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import likeRouter from "./routes/like.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import watchHistoryRouter from "./routes/watchhistory.routes.js";
import commentLikeRouter from "./routes/commentLike.routes.js";
import healthCheckRouter from "./routes/healthcheck.routes.js";


//routes declaration
app.use("/api/v1/users", userRouter); // use the userRouter for all requests to /api/v1/users
app.use("/api/v1/videos", videoRouter); // use the videoRouter for all requests to /api/v1/videos
app.use("/api/v1/comments", commentRouter); // use the commentRouter for all requests to /api/v1/comments
app.use("/api/v1/dashboard", dashboardRouter); // use the dashboardRouter for all requests to /api/v1/dashboard
app.use("/api/v1/likes", likeRouter); // use the likeRouter for all requests to /api/v1/likes
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/history", watchHistoryRouter);
app.use("/api/v1/comment-likes", commentLikeRouter);
app.use("/api/v1/health", healthCheckRouter);
// http://localhost:5000/api/v1/users/register

app.use(errorHandler);

export { app };
