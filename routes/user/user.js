const express = require("express");
const {
  editUserInfo,
  getUserVideos,
  getUserInfo,
} = require("../../controllers/userController");
const { requireUserSignIn } = require("../../middleware/auth");
const User = require("../../models/User");
const Video = require("../../models/Video");
const router = express.Router();

//edit user info
router.put("/edit/:id", requireUserSignIn, editUserInfo);

//get user videos
// get request
// /api/user/videos
// requeres user to be logged in
router.get("/videos", requireUserSignIn, getUserVideos);

// get user information
// get request
// /api/user/info
router.get("/info", getUserInfo);

// delte user
// delte request
// /api/user/delete
router.delete("/delete", requireUserSignIn, async (req, res, next) => {
  try {
    const _user = req.user;

    await User.findOneAndRemove({ _id: id });
    await Video.remove({ author: _user._id });
    return res.status(200).send({message: 'Account has been deleted successfully'})
  } catch (error) {
    next(error);
  }
});

module.exports = router;
