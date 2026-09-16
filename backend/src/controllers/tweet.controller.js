import {asyncHandler} from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    // create a new tweet
})

const getUserTweets = asyncHandler(async (req, res) => {
    // get all tweets for a user
})

const updateTweet = asyncHandler(async (req, res) => {
    // update a tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    // delete a tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}

