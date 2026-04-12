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
exports.signin = exports.signup = void 0;
const Schema_1 = require("../models/Schema");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const hashed = yield bcrypt_1.default.hash(password, 10);
        const existingUser = yield Schema_1.User.findOne({ username });
        if (existingUser) {
            return res.status(403).json({
                message: "Username already exists",
            });
        }
        const user = yield Schema_1.User.create({
            username: username,
            password: hashed,
        });
        res.status(200).json({
            message: "User created successfully",
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            message: "server error",
        });
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield Schema_1.User.findOne({ username });
        if (!user) {
            return res.status(403).json({ message: "Invalid username" });
        }
        const isValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(403).json({ message: "Invalid password" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.status(300).json({
            message: "User logged in successfully",
            token,
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            message: "server error",
        });
    }
});
exports.signin = signin;
