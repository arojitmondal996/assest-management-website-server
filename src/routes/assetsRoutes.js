const router = require("express").Router();
const assetControllers = require("../controllers/assetControllers");
const authControllers = require("../controllers/authControllers");

router.use(
  authControllers.authenticatedUser,
  authControllers.authorization("employee", "admin")
);

router.route("/").get(assetControllers.getAllAssets);

router.route("/:id").post(assetControllers.requestAssets);

module.exports = router;
