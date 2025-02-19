const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { StatusCodes } = require("http-status-codes");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const hrRoutes = require("./routes/hrRoutes");
const productRoutes = require("./routes/productRoutes");
const assetsRoutes = require("./routes/assetsRoutes");

const { createAppError, globalErrorHandler } = require("./utils/middleware");

const app = express();
const corsOptions = {
  origin: ["http://localhost:5173", "https://rashad-stack-manager.netlify.app"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/employee/assets", assetsRoutes);
app.use("/api/v1/hr", hrRoutes);
app.use("/api/v1/hr/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to HR Management API");
});

// Unhandled Routes
app.all("*", (req, res, next) => {
  try {
    createAppError(
      `Can't Find this URL (${req.originalUrl}) on this server!`,
      StatusCodes.NOT_FOUND
    );
  } catch (error) {
    next(error);
  }
});

app.use(globalErrorHandler);

module.exports = app;
