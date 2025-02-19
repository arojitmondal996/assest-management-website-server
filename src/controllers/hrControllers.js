require("dotenv").config({ path: "./.env.local" });
const { StatusCodes } = require("http-status-codes");
const { createAppError } = require("../utils/middleware");
const client = require("../utils/database");
const { ObjectId } = require("mongodb");
const Joi = require("joi");

const users = client.db("assets-management").collection("users");

const affiliateSchema = Joi.object({
  employees: Joi.array().items(Joi.string().required()),
});

exports.addToAffiliate = async (req, res, next) => {
  try {
    await client.connect();

    const { error, value } = affiliateSchema.validate(req.body);

    if (error) {
      return next(createAppError(error, StatusCodes.BAD_REQUEST));
    }

    // Update employeeId field of the selected users from array
    const result = await users.updateMany(
      { _id: { $in: value.employees.map((id) => new ObjectId(id)) } },
      { $set: { employeeId: req.user._id } }
    );

    if (result.matchedCount === 0) {
      return next(createAppError("User not found", StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAffiliate = async (req, res, next) => {
  try {
    await client.connect();

    const affiliates = await users.find({ employeeId: req.user._id }).toArray();

    res.status(StatusCodes.OK).json(affiliates);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await client.connect();

    const { id } = req.params;

    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      { $unset: { employeeId: "" } }
    );

    if (result.matchedCount === 0) {
      return next(createAppError("User not found", StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
