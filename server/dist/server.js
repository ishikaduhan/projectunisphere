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
const node_cron_1 = __importDefault(require("node-cron"));
const notificationController_1 = require("./controllers/notificationController");
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // Connect to database
        await (0, db_1.connectDB)();
        // Start HTTP listener
        app_1.default.listen(PORT, () => {
            console.log(`[Server] UniSphere API Server listening on port ${PORT} in ${process.env.NODE_ENV} mode.`);
        });
        // Schedule background notification processing to run every minute
        node_cron_1.default.schedule('* * * * *', async () => {
            try {
                console.log('[Cron] Running background task: Processing queued notifications...');
                await (0, notificationController_1.processQueuedNotifications)();
            }
            catch (error) {
                console.error('[Cron] Error processing queued notifications:', error);
            }
        });
    }
    catch (error) {
        console.error('Failed to start UniSphere API Server:', error);
        process.exit(1);
    }
};
startServer();
