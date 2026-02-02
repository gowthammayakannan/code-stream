// Validation middleware for request bodies
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map((detail) => detail.message),
            });
        }
        next();
    };
};

// Not Found handler
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    console.error('SERVER ERROR:', err);
    if (err.stack) console.error('STACK TRACE:', err.stack);

    // Check if next is a function just in case
    console.log('Is next a function?', typeof next === 'function');

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { validateRequest, notFound, errorHandler };
