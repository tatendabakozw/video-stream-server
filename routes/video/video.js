const express = require("express");
const {
  createAVideo,
  getAllVideos,
  editAVideo,
  deleteAVideo,
  getSingleVideo,
  blockVideo,
} = require("../../controllers/videoController");
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
// /api/video/edit/{videoId}
// put request
router.put("/edit/:id",requireUserSignIn, editAVideo);

// delete a video
// /api/post/video/delete/{videoId}
// delete request
router.delete("/delete/:id", deleteAVideo);

// block a video
// /api/post/video/block/{videoId}
// patch request
router.patch("/block/:id", blockVideo);

module.exports = router;
