"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.DeleteContentSchema = exports.ChatSchema = exports.AddContentSchema = exports.SigninSchema = exports.SignupSchema = void 0;
const zod_1 = require("zod");
/**
 * VALIDATION SCHEMAS
 * Define all request body schemas here
 */
// Signup schema
exports.SignupSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
});
// Signin schema
exports.SigninSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "Username is required"),
    password: zod_1.z.string().min(1, "Password is required"),
});
// Add content schema
exports.AddContentSchema = zod_1.z.object({
    link: zod_1.z.string().url().optional(), // For URLs
    // `File` is a browser API and not available in Node; multer attaches uploaded files
    // as `req.file`. Validate file server-side via multer, not with `z.instanceof(File)`.
    file: zod_1.z.any().optional(), // For PDF file upload (handled by multer)
    type: zod_1.z.enum(["article", "tweet", "pdf", "youtube", "text"]),
    title: zod_1.z.string().min(1).max(200),
    tags: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            try {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed)) {
                    return parsed.map((item) => String(item).trim()).filter(Boolean);
                }
            }
            catch (_a) {
                // ignore parse error, fall back to comma splitting
            }
            return val
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);
        }
        if (Array.isArray(val)) {
            return val.map((tag) => String(tag).trim()).filter(Boolean);
        }
        return undefined;
    }, zod_1.z.array(zod_1.z.string()).optional()),
});
// Chat schema
exports.ChatSchema = zod_1.z.object({
    query: zod_1.z
        .string()
        .min(1, "Query is required")
        .max(500, "Query must be at most 500 characters"),
});
// Delete content schema
exports.DeleteContentSchema = zod_1.z.object({
    contentId: zod_1.z.string().min(1, "Content ID is required"),
});
/**
 * VALIDATION MIDDLEWARE
 * Use this on routes to validate requests
 */
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            // Validate request body
            const validated = schema.parse(req.body);
            // Replace body with validated data
            req.body = validated;
            // Continue to next middleware/handler
            next();
        }
        catch (error) {
            // Handle Zod validation errors
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: error.issues.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
            }
            // Other errors
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
