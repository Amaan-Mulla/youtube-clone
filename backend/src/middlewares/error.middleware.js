const errorHandler = (err, req, res, next) => {

    if (err.code === 11000 && err.keyPattern?.email) {
        return res.status(409).json({
            statusCode: 409,
            message: "Email is already in use.",
            errors: [],
            data: null,
            success: false
        });
    }

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        statusCode,
        message: err.message || "Something went wrong",
        errors: err.errors || [],
        data: err.data || null,
        success: false
    });
};

export { errorHandler };
