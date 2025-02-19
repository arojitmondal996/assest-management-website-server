const { StatusCodes } = require("http-status-codes");
const client = require("../utils/database");
const { ObjectId } = require("mongodb");

const assets = client.db("assets-management").collection("assets");

exports.requestAssets = async (req, res, next) => {
  try {
    await client.connect();

    const asset = await assets.insertOne({
      productId: new ObjectId(req.params.id),
      requestedBy: new ObjectId(req.user._id),
      addedAt: new Date(),
    });

    res.status(StatusCodes.OK).json(asset);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAllAssets = async (req, res, next) => {
  try {
    await client.connect();
    const allAssets = await assets
      .aggregate([
        {
          $lookup: {
            from: "products", // The collection to join
            localField: "productId", // The field from the assets collection
            foreignField: "_id", // The field from the products collection
            as: "productDetails", // The name of the new array field to add to the assets documents
          },
        },
        {
          $unwind: "$productDetails", // Unwind the array to include product details as a single object
        },
        {
          $addFields: {
            assetName: "$productDetails.name",
            assetType: "$productDetails.type",
            availability: {
              $cond: {
                if: { $eq: ["$productDetails.quantity", 0] },
                then: "Unavailable",
                else: "Available",
              },
            },
          },
        },
        {
          $project: {
            productDetails: 0, // Remove the productDetails field
          },
        },
      ])
      .toArray();

    res.status(StatusCodes.OK).json(allAssets);
  } catch (error) {
    console.error(error);
    next(error);
  } finally {
    await client.close();
  }
};
