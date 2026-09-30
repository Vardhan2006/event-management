const { z } = require("zod");

const servicesSchema = z.preprocess((val) => {
  if (val == null || val === "") return [];
  if (Array.isArray(val)) return val.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((s) => s.trim()).filter(Boolean);
      }
    } catch {
      // not JSON — treat as comma-separated
    }
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}, z.array(z.string()));

const existingImagesSchema = z.preprocess((val) => {
  if (val == null || val === "") return undefined;
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return [val];
    }
  }
  return undefined;
}, z.array(z.string()).optional());

const createVenueSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required"),
  location: z
    .string({ required_error: "Location is required" })
    .trim()
    .min(1, "Location is required"),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(1, "Description is required"),
  capacity: z.coerce
    .number({ invalid_type_error: "Capacity must be a number" })
    .min(0, "Capacity must be at least 0"),
  pricePerDay: z.coerce
    .number({ invalid_type_error: "Price per day must be a number" })
    .min(0, "Price per day must be at least 0"),
  services: servicesSchema.optional(),
  ownerId: z.any().optional(),
}).strict();

const updateVenueSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").optional(),
  location: z.string().trim().min(1, "Location cannot be empty").optional(),
  description: z.string().trim().min(1, "Description cannot be empty").optional(),
  capacity: z.coerce
    .number({ invalid_type_error: "Capacity must be a number" })
    .min(0, "Capacity must be at least 0")
    .optional(),
  pricePerDay: z.coerce
    .number({ invalid_type_error: "Price per day must be a number" })
    .min(0, "Price per day must be at least 0")
    .optional(),
  services: servicesSchema.optional(),
  existingImages: existingImagesSchema,
  ownerId: z.any().optional(),
}).strict();

const availabilityQuerySchema = z.object({
  month: z
    .string({ required_error: "Month is required" })
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format (01-12)"),
}).strict();

const searchQuerySchema = z
  .object({
    q: z.string().trim().optional(),
    location: z.string().trim().optional(),
    minCapacity: z.coerce.number().min(0).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sort: z
      .enum(["price_asc", "price_desc", "newest"])
      .default("newest"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(100),
  })
  .strict()
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "minPrice cannot be greater than maxPrice",
      path: ["minPrice"],
    }
  );

module.exports = {
  createVenueSchema,
  updateVenueSchema,
  availabilityQuerySchema,
  searchQuerySchema,
};
