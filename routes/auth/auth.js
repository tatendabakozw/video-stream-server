const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../../controllers/authController");

// register user
// /post request
// /api/auth/regsiter
router.post("/register", registerUser);

// login a user
// post request
// /api/auth/lgin
router.post("/login", loginUser);

module.exports = router;
