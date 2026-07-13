"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const crypto_1 = __importDefault(require("crypto"));
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || 'INTERNAL_ERROR';
    const message = err.message || 'An unexpected error occurred';
    const details = err.details || undefined;
    // Generate request ID for correlation and tracking
    const requestId = req.headers['x-request-id'] || `req_${crypto_1.default.randomBytes(8).toString('hex')}`;
    // Log error (redacted logs in production)
    console.error(`[Error] Request ID: ${requestId} | Code: ${errorCode} | Status: ${statusCode} | Message: ${message}`);
    if (statusCode === 500 && err.stack) {
        console.error(err.stack);
    }
    res.status(statusCode).json({
        error: {
            code: errorCode,
            message: statusCode === 500 && process.env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : message,
            details,
            requestId,
        },
    });
};
exports.errorHandler = errorHandler;
