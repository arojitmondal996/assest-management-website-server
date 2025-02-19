const router = require("express").Router();
const userControllers = require("../controllers/userControllers");
const authControllers = require("../controllers/authControllers");
router
  .route("/")
  .get(
    authControllers.authenticatedUser,
    authControllers.authorization("hr-manager", "employee", "admin"),
    userControllers.getAvailableUsers
  );
router
  .route("/:id")
  .get(
    authControllers.authenticatedUser,
    authControllers.authorization("hr-manager", "employee", "admin"),
    userControllers.getUser
  )
  .patch(authControllers.authenticatedUser, userControllers.updateUser);

router.route("/employee").post(userControllers.createEmployee);
router.route("/hr-manager").post(userControllers.createHrManager);

module.exports = router;
