const { StatusCodes } = require("http-status-codes");
const Joi = require("joi");

exports.createAppError = function error(message, statusCode) {
  const error = new Error(message);

  error.statusCode = statusCode;
  error.status = `${statusCode}`.startsWith("4") ? "failed" : "error";
  error.isOperational = true;

  Error.captureStackTrace(error, error);

  throw error;
};

// eslint-disable-next-line no-unused-vars
exports.globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.status = err.status || "error";

  // Check if the error is a Joi validation error
  if (Joi.isError(err)) {
    err.statusCode = StatusCodes.BAD_REQUEST;
    err.status = "failed";
    err.message = err.details.map((detail) => detail.message).join(", ");
  }

  // A) API
  if (req.originalUrl.startsWith("/api/v1")) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // B) RENDERED WEBSITE
  console.error("ERROR 💥", err);
  return res.status(err.statusCode).json({
    title: "Something went wrong!",
    msg: err.message,
  });
};
