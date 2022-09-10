const express = require("express");
const { adminRegister, adminLogin } = require("../../controllers/adminController");
const router = express.Router();

// register user
// /post request
// /api/auth/regsiter
router.post("/register", adminRegister);

// login a user
// post request
// /api/auth/lgin
router.post("/login", adminLogin);

module.exports = router;
