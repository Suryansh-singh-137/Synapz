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
exports.genrateLink = void 0;
const Schema_1 = require("../models/Schema");
const hashGenrator_1 = require("../utils/hashGenrator");
const genrateLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingLink = yield Schema_1.Link.findOne({
            //@ts-ignore
            userId: req.userId,
        });
        if (existingLink) {
            res.json({
                hash: existingLink.hash,
            });
            return;
        }
        const share = req.body.share;
        const hash = (0, hashGenrator_1.random)(10);
        if (share) {
            yield Schema_1.Link.create({
                //@ts-ignore
                userId: req.userId,
                hash: hash,
            });
            return res.json({
                message: "/share/" + hash,
            });
        }
        else {
            yield Schema_1.Link.deleteOne({
                // @ts-ignore
                userId: req.userId,
            });
            return res.json({
                message: "Link deleted successfully",
            });
        }
    }
    catch (err) {
        return res.status(500).json({
            message: "Server error while generating link",
        });
    }
});
exports.genrateLink = genrateLink;
