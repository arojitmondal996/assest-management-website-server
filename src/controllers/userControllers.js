require("dotenv").config({ path: "./.env.local" });
const { StatusCodes } = require("http-status-codes");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const process = require("process");

const { createAppError } = require("../utils/middleware");
const client = require("../utils/database");
const {
  createEmployee,
  updateEmployee,
  createHrManager,
} = require("../utils/validatorSchema");

const users = client.db("assets-management").collection("users");

exports.createEmployee = async (req, res, next) => {
  try {
    await client.connect();
    const value = await createEmployee.validateAsync(req.body);

    const user = await users.insertOne({
      ...value,
      role: "employee",
    });

    const token = jwt.sign(
      { _id: user.insertedId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "10h",
      }
    );
    console.log("i am your token",token)

    res.status(StatusCodes.OK).json({ token });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.createHrManager = async (req, res, next) => {
  try {
    await client.connect();
    await client.connect();
    const value = await createHrManager.validateAsync(req.body);

    const user = await users.insertOne({
      ...value,
      role: "hr-manager",
    });

    const token = jwt.sign(
      { _id: user.insertedId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "10h",
      }
    );

    res.status(StatusCodes.OK).json({ token });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAvailableUsers = async (req, res, next) => {
  try {
    await client.connect();
    // Get all the users who are not affiliated
    const allUsers = await users
      .find({ employeeId: { $exists: false }, role: "employee" })
      .toArray();
    res.status(StatusCodes.OK).json(allUsers);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    await client.connect();
    const user = await users.findOne({
      _id: new ObjectId(req.params.id),
    });
    if (!user) {
      return next(createAppError("User not found", StatusCodes.NOT_FOUND));
    }
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    await client.connect();
    const value = await updateEmployee.validateAsync(req.body);

    // Check logged in user is the same as the user being updated
    const currentUser = await users.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (currentUser.email !== req.user.email) {
      return next(
        createAppError(
          "You are not authorized to perform this action",
          StatusCodes.FORBIDDEN
        )
      );
    }

    const result = await users.updateOne(
      { _id: new ObjectId(currentUser._id) },
      { $set: value }
    );

    if (result.matchedCount === 0) {
      return next(createAppError("User not found", StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
