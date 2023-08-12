const express = require("express");

const ctrl = require("../../controllers/auth-controller");
const { validateBody, authenticate, upload } = require("../../middlewares");
const { schemas } = require("../../models/user");

const router = express.Router();

// SignUp
router.post(
  "/register",
  upload.single("avatar"),
  validateBody(schemas.registerSchema),
  ctrl.register
);

// SignIn
router.post("/login", validateBody(schemas.loginSchema), ctrl.login);

// isTokenActive
router.get("/current", authenticate, ctrl.getCurrent);

// Logout
router.post("/logout", authenticate, ctrl.logout);

// Change user data
router.patch("/update", authenticate, ctrl.updateUser);

// Change user avatar
router.patch(
  "/avatar",
  authenticate,
  upload.single("avatar"),
  ctrl.updateAvatar
);

module.exports = router;
