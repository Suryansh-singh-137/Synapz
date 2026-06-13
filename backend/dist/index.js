"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const autht_1 = require("./controller/autht");
const content_1 = require("./controller/content");
const authmid_1 = require("./middleware/authmid");
const generateLink_1 = require("./controller/generateLink");
const chatController_1 = require("./controller/chatController");
const extractController_1 = require("./controller/extractController");
const Schema_1 = require("./models/Schema");
const validation_1 = require("./utils/validation");
const fileUpload_1 = require("./utils/fileUpload");
const MONGO_URL = process.env.MONGO_URL;
const connectToDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(MONGO_URL);
        console.log("Connected to MongoDB");
    }
    catch (e) {
        console.error("Error connecting to MongoDB:", e);
    }
});
connectToDatabase();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"],
    credentials: true,
}));
console.log("Registering /api/v1/test route");
app.get("/api/v1/test", (req, res) => {
    res.json({ message: "Hello World" });
});
// ============ AUTHENTICATION ROUTES ============
app.post("/api/v1/signin", (0, validation_1.validateRequest)(validation_1.SigninSchema), autht_1.signin);
app.post("/api/v1/signup", (0, validation_1.validateRequest)(validation_1.SignupSchema), autht_1.signup);
// ============ CONTENT ROUTES ============
app.post("/api/v1/content", authmid_1.userMiddleware, fileUpload_1.upload.single("file"), // Handle single file upload
(0, validation_1.validateRequest)(validation_1.AddContentSchema), content_1.addContent);
app.get("/api/v1/content", authmid_1.userMiddleware, content_1.getContent);
app.delete("/api/v1/content", authmid_1.userMiddleware, (0, validation_1.validateRequest)(validation_1.DeleteContentSchema), content_1.deleteContent);
// ✅ FILE UPLOAD ENDPOINT (optional alternative)
app.post("/api/v1/upload-pdf", authmid_1.userMiddleware, fileUpload_1.upload.single("file"), fileUpload_1.uploadPdfFile);
// ============ BRAIN ROUTES ============
app.post("/api/v1/brain/extract", authmid_1.userMiddleware, extractController_1.extractContent);
app.post("/api/v1/brain/extract-all", authmid_1.userMiddleware, extractController_1.extractAllContent);
app.post("/api/v1/brain/chat", authmid_1.userMiddleware, (0, validation_1.validateRequest)(validation_1.ChatSchema), chatController_1.chatWithBrain);
app.post("/api/v1/brain/share", authmid_1.userMiddleware, generateLink_1.genrateLink);
app.delete("/api/v1/brain/share", authmid_1.userMiddleware, generateLink_1.deleteLink);
// ============ PUBLIC ROUTES ============
app.post("/api/v1/brain/:hash/chat", chatController_1.chatWithSharedBrain);
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield Schema_1.Link.findOne({ hash: hash });
    if (!link) {
        return res.status(404).json({ message: "Link not found" });
    }
    const content = yield Schema_1.Content.find({ userId: link.userId });
    const user = yield Schema_1.User.findOne({ _id: link.userId });
    if (!user) {
        return res.status(411).json({ message: "User not found" });
    }
    res.json({
        username: user.username,
        content: content,
    });
}));
// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({
        message: "Server error",
        error: err.message,
    });
});
// ============ SERVER ============
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
