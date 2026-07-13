"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticateJWT = void 0;
const tokens_1 = require("../utils/tokens");
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const err = new Error('Access token is missing or malformed');
        err.statusCode = 401;
        err.code = 'UNAUTHORIZED';
        return next(err);
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, tokens_1.verifyAccessToken)(token);
        req.user = {
            id: decoded.sub,
            roles: decoded.roles,
        };
        next();
    }
    catch (error) {
        const err = new Error(error.name === 'TokenExpiredError' ? 'Access token has expired' : 'Invalid access token');
        err.statusCode = 401;
        err.code = 'UNAUTHORIZED';
        next(err);
    }
};
exports.authenticateJWT = authenticateJWT;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            const err = new Error('User not authenticated');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
        if (!hasRole) {
            const err = new Error('You do not have permission to access this resource');
            err.statusCode = 403;
            err.code = 'FORBIDDEN';
            return next(err);
        }
        next();
    };
};
exports.requireRole = requireRole;
