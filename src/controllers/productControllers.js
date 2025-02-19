const { StatusCodes } = require("http-status-codes");
const { createAppError } = require("../utils/middleware");
const client = require("../utils/database");
const { ObjectId } = require("mongodb");
const { createProduct } = require("../utils/validatorSchema");

const products = client.db("assets-management").collection("products");

exports.addProduct = async (req, res, next) => {
  try {
    await client.connect();
    const { error, value } = createProduct.validate(req.body);

    if (error) {
      return next(createAppError(error, StatusCodes.BAD_REQUEST));
    }

    const product = await products.insertOne({
      ...value,
      addedAt: new Date(),
      managerId: new ObjectId(req.user._id),
    });

    res.status(StatusCodes.OK).json(product);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    await client.connect();

    const { stockStatus, assetType, sortBy, name } = req.query;
    const filter = { managerId: new ObjectId(req.user._id) }; // Filter by logged-in user's ID
    const sort = {};

    if (stockStatus && stockStatus !== "null") {
      filter.quantity = stockStatus === "Available" ? { $gt: 0 } : { $eq: 0 };
    }

    if (assetType && assetType !== "null") {
      filter.type = assetType;
    }

    if (name && name !== "null") {
      filter.name = { $regex: name, $options: "i" }; // Case-insensitive search
    }

    if (sortBy && sortBy !== "null") {
      sort.quantity = sortBy === "ASC" ? 1 : -1;
    }

    const allProducts = await products.find(filter).sort(sort).toArray();

    res.status(StatusCodes.OK).json(allProducts);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    await client.connect();
    const product = await products.findOne({ _id: ObjectId(req.params.id) });

    if (!product) {
      return next(createAppError("Product not found", StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({ product });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    await client.connect();
    const value = await createProduct.validateAsync(req.body);

    const product = await products.updateOne(
      { _id: ObjectId(req.params.id) },
      { $set: { ...value } }
    );

    if (product.matchedCount === 0) {
      return next(createAppError("Product not found", StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await client.connect();
    const product = await products.deleteOne({ _id: ObjectId(req.params.id) });

    if (product.deletedCount === 0) {
      return next(createAppError("Product not found", StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
