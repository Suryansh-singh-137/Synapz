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
dotenv_1.default.config();
const autht_1 = require("./controller/autht");
const content_1 = require("./controller/content");
const authmid_1 = require("./middleware/authmid");
const generateLink_1 = require("./controller/generateLink");
const Schema_1 = require("./models/Schema");
const MONGO_URL = process.env.MONGO_URL;
const connectToDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(MONGO_URL);
        console.log("Connected to MongoDB");
    }
    catch (e) {
        console.log("Error connecting to MongoDB"), e;
    }
});
connectToDatabase();
app.use(express_1.default.json());
app.post("/api/v1/signin", autht_1.signin);
app.post("/api/v1/signup", autht_1.signup);
app.post("/api/v1/content", authmid_1.userMiddleware, content_1.addContent);
app.get("/api/v1/content", authmid_1.userMiddleware, content_1.getContent);
app.delete("/api/v1/content", authmid_1.userMiddleware, content_1.deleteContent);
app.post("/api/v1/brain/share", authmid_1.userMiddleware, generateLink_1.genrateLink);
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield Schema_1.Link.findOne({
        hash: hash,
    });
    if (!link) {
        return res.status(404).json({ message: "Link not found" });
    }
    // userid
    const content = yield Schema_1.Content.find({
        userId: link.userId,
    });
    // user
    const user = yield Schema_1.User.findOne({
        _id: link.userId,
    });
    console.log(user);
    if (!user) {
        return res.status(411).json({ message: "User not found" });
    }
    res.json({
        username: user.username,
        content: content,
    });
}));
app.listen(3000, () => {
    console.log("server is running");
});
