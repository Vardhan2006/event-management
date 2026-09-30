const { z } = require("zod");
const mongoose = require("mongoose");

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ID format",
});

const createBookingSchema = z.object({
  venueId: objectIdSchema,
  eventDate: z
    .string({ required_error: "Event date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Event date must be in YYYY-MM-DD format"),
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),
  notes: z.string().trim().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["approved", "rejected"], {
    errorMap: () => ({ message: "Status must be 'approved' or 'rejected'" }),
  }),
});

const queryFilterSchema = z.object({
  status: z
    .enum(["pending", "approved", "rejected", "cancelled"])
    .optional(),
});

module.exports = {
  createBookingSchema,
  updateStatusSchema,
  queryFilterSchema,
};
