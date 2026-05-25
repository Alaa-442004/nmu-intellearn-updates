import { z } from "zod";

export const CourseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  duration: z.string(),
  students: z.number(),
  rating: z.number(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
});

export const CoursesResponseSchema = z.object({
  success: z.boolean(),
  courses: z.array(CourseSchema).optional(),
  error: z.string().optional(),
});

export const CourseDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  longDescription: z.string().nullable(),
  duration: z.string().nullable(),
  students: z.number(),
  rating: z.number(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  instructor: z.string(),
  modules: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      duration: z.string().nullable(),
    })
  ),
});

export const CourseDetailResponseSchema = z.object({
  success: z.boolean(),
  course: CourseDetailSchema.optional(),
  error: z.string().optional(),
});

export const CertificateSchema = z.object({
  id: z.number(),
  title: z.string(),
  course: z.string(),
  score: z.number(),
  date: z.string().nullable(),
  certificateNumber: z.string(),
  verified: z.boolean(),
});

export const CertificatesResponseSchema = z.object({
  success: z.boolean(),
  certificates: z.array(CertificateSchema).optional(),
  error: z.string().optional(),
});
