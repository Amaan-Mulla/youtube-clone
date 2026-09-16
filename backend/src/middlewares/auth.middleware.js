import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") // Get the access token from the cookies
        
        if(!token) {
            throw new APIError(401, "Unauthorized request")
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Verify the access token using the secret key
        
        const user = await User.findById(decodedToken._id); // Find the user by ID from the decoded token
        
        if(!user) {
            throw new APIError(401, "Invalid access token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new APIError(401, "Invalid access token");
    }
})

export const optionalVerifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        next();
        return;
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new APIError(401, "Invalid access token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new APIError(401, "Invalid access token");
    }
});
