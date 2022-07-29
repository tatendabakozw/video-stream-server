const express = require("express");
const {
  createAVideo,
  getAllVideos,
  editAVideo,
  deleteAVideo,
  getSingleVideo,
} = require("../../controllers/videoController");
const upload = require("../../helpers/multer");
const { requireUserSignIn } = require("../../middleware/auth");
const router = express.Router();

// create a video
// /api/post/video/create
// post request
router.post("/create",requireUserSignIn, createAVideo);

// get all videos
// /api/post/video/explore
// get request
router.get("/explore", getAllVideos);

// get single video
// get request
// /api/video/single/{videoId}
router.get('/single', getSingleVideo)

// edit video
// /api/post/video/edit/{videoId}
// put request
router.put("/edit/:id", editAVideo);

// delete a video
// /api/post/video/delete/{videoId}
// delete request
router.delete("/delete/:id", deleteAVideo);

module.exports = router;
