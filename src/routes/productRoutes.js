const router = require("express").Router();
const productControllers = require("../controllers/productControllers");
const authControllers = require("../controllers/authControllers");

router.use(
  authControllers.authenticatedUser,
  authControllers.authorization("hr-manager", "employee")
);
router
  .route("/")
  .get(productControllers.getAllProducts)
  .post(productControllers.addProduct);

router
  .route("/:id")
  .get(productControllers.getProductById)
  .patch(productControllers.updateProduct);

module.exports = router;
