// This is a middleware function that wraps an asynchronous request handler and catches any errors that occur during its execution.
// If an error occurs, it passes the error to the next middleware function (usually an error handler) for further processing.
// visual flow of asyncHandler:

// Request
//    │
//    ▼
// asyncHandler(getUser) -> this is requestHandler, which is a function that handles the request and returns a promise
//    │
//    ▼
// Returned middleware
//    │
//    ▼
// getUser(req, res, next)
//    │
//    ├───────────────┐
//    │               │
// Success         Throws Error
//    │               │
//    ▼               ▼
// Response      Promise rejected
//                    │
//                    ▼
//                .catch(error)
//                    │
//                    ▼
//                next(error)
//                    │
//                    ▼
//       Express Error Middleware


const asyncHandler = (requestHandler) => {  //An async function always returns a Promise
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((error) => next(error));
    };
};








export { asyncHandler };


// this is the old code for asyncHandler, which is commented out. 
// It is a middleware function that wraps an asynchronous request handler and catches any errors that occur during its execution. 
// If an error occurs, it sends a JSON response with the error message and status code.
 

// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(error.statusCode || 500).json({
//             success: false,
//             message: error.message
//     })
//     }
// }