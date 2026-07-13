"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const clubs_1 = __importDefault(require("./routes/clubs"));
const events_1 = __importDefault(require("./routes/events"));
const registrations_1 = __importDefault(require("./routes/registrations"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const recommendationRoutes_1 = __importDefault(require("./routes/recommendationRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
// Body and Cookie Parsers
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// Logger
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
// Routes
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/users', users_1.default);
app.use('/api/v1/clubs', clubs_1.default);
app.use('/api/v1/events', events_1.default);
app.use('/api/v1/registrations', registrations_1.default);
app.use('/api/v1/attendance', attendance_1.default);
app.use('/api/v1/notifications', notificationRoutes_1.default);
app.use('/api/v1/recommendations', recommendationRoutes_1.default);
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', env: process.env.NODE_ENV });
});
// Catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Resource not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    next(err);
});
// Central Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
