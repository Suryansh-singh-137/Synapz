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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContent = exports.getContent = exports.addContent = void 0;
const Schema_1 = require("../models/Schema");
const addContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { link, type, title, tags } = req.body;
        // @ts-ignore
        const userId = req.userId;
        const content = yield Schema_1.Content.create({
            link,
            type,
            title,
            tags,
            userId,
        });
        res.status(200).json({
            message: "Content added successfully",
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Failed to add content",
        });
    }
});
exports.addContent = addContent;
const getContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userId = req.userId;
        const content = yield Schema_1.Content.find({
            userId: userId,
        }).populate("userId", "username");
        res.status(203).json({
            content,
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "server error",
        });
    }
});
exports.getContent = getContent;
const deleteContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    // @ts-ignore
    const userId = req.userId;
    try {
        yield Schema_1.Content.deleteMany({
            contentId,
            userId: userId,
        });
        res.status(201).json({
            msg: "content deleted",
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "server error",
        });
    }
});
exports.deleteContent = deleteContent;
