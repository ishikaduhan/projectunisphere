"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const testMongo = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose_1.default.connect('mongodb://127.0.0.1:27017/unisphere');
        console.log('Connected successfully!');
        await mongoose_1.default.disconnect();
        console.log('Disconnected successfully!');
        process.exit(0);
    }
    catch (err) {
        console.error('Failed to connect:', err);
        process.exit(1);
    }
};
testMongo();
