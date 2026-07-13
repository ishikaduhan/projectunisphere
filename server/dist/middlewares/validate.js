"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const details = error.errors.map((err) => {
                    // err.path starts with 'body', 'query', or 'params', let's format path nicely
                    const field = err.path.length > 1 ? err.path.slice(1).join('.') : err.path[0];
                    return {
                        field: String(field),
                        issue: err.message,
                    };
                });
                const valError = new Error('Invalid request payload');
                valError.statusCode = 400;
                valError.code = 'VALIDATION_ERROR';
                valError.details = details;
                next(valError);
            }
            else {
                next(error);
            }
        }
    };
};
exports.validate = validate;
