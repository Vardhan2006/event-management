const multer = require("multer");
const { z } = require("zod");
const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  // 1. ApiError
  if (err instanceof ApiError) {
    if (err.statusCode === 500) {
      console.error(err);
      return res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Something went wrong",
        },
      });
    }
    const responseBody = {
      error: {
        code: err.code,
        message: err.message,
      },
    };
    if (err.details) {
      responseBody.error.details = err.details;
    }
    return res.status(err.statusCode).json(responseBody);
  }

  // 2. ZodError
  if (err instanceof z.ZodError || err.name === "ZodError") {
    const fieldErrors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: fieldErrors,
      },
    });
  }

  // 3. Mongoose CastError (invalid ObjectId format)
  if (err.name === "CastError") {
    return res.status(400).json({
      error: {
        code: "INVALID_ID",
        message: "Invalid ID format",
      },
    });
  }

  // 4. Mongoose ValidationError
  if (err.name === "ValidationError") {
    const fieldErrors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: fieldErrors,
      },
    });
  }

  // 5. MongoDB Duplicate Key Error (11000)
  if (err.code === 11000 || (err.name === "MongoServerError" && err.code === 11000)) {
    const errMsg = err.message || "";
    if (errMsg.includes("email") || (err.keyPattern && err.keyPattern.email)) {
      return res.status(409).json({
        error: {
          code: "EMAIL_TAKEN",
          message: "Email is already registered",
        },
      });
    }
    if (errMsg.includes("venueId") || (err.keyPattern && err.keyPattern.venueId)) {
      return res.status(409).json({
        error: {
          code: "DATE_ALREADY_BOOKED",
          message: "This venue is already booked for the selected date",
        },
      });
    }
    return res.status(409).json({
      error: {
        code: "DUPLICATE_KEY",
        message: "Duplicate key error",
      },
    });
  }

  // 6. JWT Errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      },
    });
  }

  // 7. Multer Errors
  if (err instanceof multer.MulterError || err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: {
          code: "LIMIT_FILE_SIZE",
          message: "File size exceeds 5MB limit",
        },
      });
    }
    if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: {
          code: "LIMIT_FILE_COUNT",
          message: "Cannot upload more than 5 files",
        },
      });
    }
    return res.status(400).json({
      error: {
        code: "FILE_UPLOAD_ERROR",
        message: err.message || "File upload error",
      },
    });
  }

  // 8. Body-Parser Malformed JSON SyntaxError
  if (err.type === "entity.parse.failed" || (err instanceof SyntaxError && err.status === 400 && "body" in err)) {
    return res.status(400).json({
      error: {
        code: "MALFORMED_JSON",
        message: "Invalid JSON payload",
      },
    });
  }

  // 9. Generic Internal Server Error (never leak stack trace or internal message)
  console.error(err);
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    },
  });
};

module.exports = errorHandler;
