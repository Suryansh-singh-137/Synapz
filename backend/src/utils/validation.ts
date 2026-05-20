import { z } from "zod";

/**
 * VALIDATION SCHEMAS
 * Define all request body schemas here
 */

// Signup schema
export const SignupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Signin schema
export const SigninSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Add content schema
export const AddContentSchema = z.object({
  link: z.string().url().optional(), // For URLs
  // `File` is a browser API and not available in Node; multer attaches uploaded files
  // as `req.file`. Validate file server-side via multer, not with `z.instanceof(File)`.
  file: z.any().optional(), // For PDF file upload (handled by multer)
  type: z.enum(["article", "tweet", "pdf", "youtube", "text"]),
  title: z.string().min(1).max(200),
  tags: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
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
  }, z.array(z.string()).optional()),
});
// Chat schema
export const ChatSchema = z.object({
  query: z
    .string()
    .min(1, "Query is required")
    .max(500, "Query must be at most 500 characters"),
});

// Delete content schema
export const DeleteContentSchema = z.object({
  contentId: z.string().min(1, "Content ID is required"),
});

/**
 * VALIDATION MIDDLEWARE
 * Use this on routes to validate requests
 */
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      // Validate request body
      const validated = schema.parse(req.body);

      // Replace body with validated data
      req.body = validated;

      // Continue to next middleware/handler
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.issues.map((err: z.ZodIssue) => ({
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
