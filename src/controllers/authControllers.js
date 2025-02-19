require("dotenv").config({ path: "./.env.local" });
const { StatusCodes } = require("http-status-codes");
const { createAppError } = require("../utils/middleware");
const process = require("process");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const client = require("../utils/database");
const { promisify } = require("util");
const { ObjectId } = require("mongodb");

const users = client.db("assets-management").collection("users");

const schema = Joi.object({
  email: Joi.string().email().required(),
});

exports.authenticatedUser = async (req, res, next) => {
  try {
    // 1) Getting token and check of it's there
    const token =
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer");

    if (!token) {
      createAppError(
        "You are not logged in! Please log in to get access.",
        StatusCodes.UNAUTHORIZED
      );
    }
    const jwtToken = req.headers.authorization.split(" ")[1];
    const decoded = await promisify(jwt.verify)(
      jwtToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    // 2) Check if user still exists
    const currentUser = await users.findOne({ _id: new ObjectId(decoded._id) });

    if (!currentUser) {
      return next(
        createAppError(
          "The user belonging to this token does no longer exist.",
          StatusCodes.UNAUTHORIZED
        )
      );
    }
    //  3) Grant access to protected route
    req.user = currentUser;
    res.locals.user = currentUser;

    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.authorization = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        createAppError(
          "You are not authorized to perform this action",
          StatusCodes.FORBIDDEN
        )
      );
    }
    next();
  };
};

exports.currentUser = async (req, res, next) => {
  try {
    const user = await users.findOne({ _id: new ObjectId(req.user._id) });

    if (!user) {
      return next(
        createAppError(
          "The user belonging to this token does no longer exist.",
          StatusCodes.UNAUTHORIZED
        )
      );
    }

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    await client.connect();
    const value = await schema.validateAsync({ email: req.body.email });
    const user = await users.findOne({ email: value.email });

    // Check if user exists
    if (!user) {
      return next(
        createAppError("Invalid email or password", StatusCodes.UNAUTHORIZED)
      );
    }

    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "10h",
    });

    res.status(StatusCodes.OK).json({ token });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
