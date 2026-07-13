"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@unisphere.edu';
let transporter = null;
if (EMAIL_HOST && EMAIL_PORT && EMAIL_USER && EMAIL_PASS) {
    transporter = nodemailer_1.default.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: EMAIL_PORT === 465,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });
}
const sendEmail = async (to, subject, text, html) => {
    if (!transporter) {
        console.info(`[Email] skipped send to ${to} because SMTP is not configured. Subject: ${subject}`);
        return;
    }
    await transporter.sendMail({
        from: EMAIL_FROM,
        to,
        subject,
        text,
        html,
    });
};
exports.sendEmail = sendEmail;
