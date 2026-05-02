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
  link: z.string().url("Invalid URL").optional(),
  type: z.enum(["article", "tweet", "pdf", "text", "youtube"], {
    message: "Type must be one of: article, tweet, pdf, text, youtube",
  }),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  tags: z.array(z.string()).optional(),
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
