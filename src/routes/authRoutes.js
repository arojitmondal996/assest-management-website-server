const router = require("express").Router();
const authControllers = require("../controllers/authControllers");

router.route("/login").post(authControllers.login);
router
  .route("/me")
  .get(authControllers.authenticatedUser, authControllers.currentUser);

module.exports = router;
