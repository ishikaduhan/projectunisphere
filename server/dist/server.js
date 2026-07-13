"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables before importing config or app
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // Connect to MongoDB
        await (0, db_1.connectDB)();
        // Start HTTP Server
        app_1.default.listen(PORT, () => {
            console.log(`[Server] UniSphere API Server listening on port ${PORT} in ${process.env.NODE_ENV} mode.`);
        });
    }
    catch (error) {
        console.error('Failed to start UniSphere API Server:', error);
        process.exit(1);
    }
};
startServer();
