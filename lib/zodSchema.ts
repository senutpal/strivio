import { z } from "zod";

export const CourseLevels = ["Beginner", "Intermediate", "Advanced"] as const;
export const CourseStatus = ["Draft", "Published", "Archieved"] as const;

export const courseCategories = [
  "Development",
  "Buisness",
  "Finance",
  "It & Software",
  "Office Productivity",
  "Design",
  "health & FItness",
  "Marketing",
  "Music",
  "Persoanl Development",
] as const;

export const courseSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),

  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters long" }),

  fileKey: z.string().min(1, { message: "File key is required" }),

  price: z.number().min(1, { message: "Price must be at least 1" }),

  duration: z
    .number()
    .min(1, { message: "Duration must be at least 1 hour" })
    .max(500, { message: "Duration cannot exceed 500 hour" }),

  level: z.enum(CourseLevels, {
    message: "Level must be one of: Beginner, Intermediate, or Advanced",
  }),

  category: z.enum(courseCategories, {
    message: "Category is required",
  }),

  smallDescription: z
    .string()
    .min(3, { message: "Small description must be at least 3 characters long" })
    .max(200, { message: "Small description cannot exceed 200 characters" }),

  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters long" }),

  status: z.enum(CourseStatus, {
    message: "Status must be one of: Draft, Published, or Archieved",
  }),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
