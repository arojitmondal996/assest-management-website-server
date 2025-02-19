const router = require("express").Router();
const hrControllers = require("../controllers/hrControllers");
const authControllers = require("../controllers/authControllers");

router
  .route("/affiliate")
  .get(
    authControllers.authenticatedUser,
    authControllers.authorization("hr-manager"),
    hrControllers.getAffiliate
  )
  .patch(
    authControllers.authenticatedUser,
    authControllers.authorization("hr-manager"),
    hrControllers.addToAffiliate
  );

router
  .route("/affiliate/:id")
  .patch(
    authControllers.authenticatedUser,
    authControllers.authorization("hr-manager"),
    hrControllers.remove
  );

module.exports = router;
