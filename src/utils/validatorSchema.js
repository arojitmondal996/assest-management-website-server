const Joi = require("joi");
const client = require("../utils/database");
const users = client.db("manager").collection("users");
const { StatusCodes } = require("http-status-codes");

async function checkUserExists(email) {
  const user = await users.findOne({ email: email });
  return user !== null;
}

exports.createEmployee = Joi.object({
  uid: Joi.string().required(),
  displayName: Joi.string().required(),
  email: Joi.string()
    .email()
    .required()
    .external(async (value) => {
      const userExists = await checkUserExists(value);
      if (userExists) {
        const error = new Error("User already exists");
        error.statusCode = StatusCodes.CONFLICT; // Conflict
        return Promise.reject(error);
      }
    }),
  photoURL: Joi.string().uri(),
  birthDate: Joi.date(),
});

exports.createHrManager = Joi.object({
  uid: Joi.string().required(),
  displayName: Joi.string().required(),
  companyName: Joi.string().required(),
  companyLogo: Joi.string().uri().required(),
  email: Joi.string()
    .email()
    .required()
    .external(async (value) => {
      const userExists = await checkUserExists(value);
      if (userExists) {
        const error = new Error("User already exists");
        error.statusCode = StatusCodes.CONFLICT; // Conflict
        return Promise.reject(error);
      }
    }),
  photoURL: Joi.string().uri(),
  birthDate: Joi.date(),
  package: Joi.string(),
  maxEmployees: Joi.number(),
});

exports.updateEmployee = Joi.object({
  displayName: Joi.string(),
  paymentMethod: Joi.string(),
  employees: Joi.number(),
});

exports.createProduct = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  quantity: Joi.number().required(),
});

exports.createAssets = Joi.object({
  assetName: Joi.string().required(),
  assetType: Joi.string().required(),
  availability: Joi.string().required(),
});
