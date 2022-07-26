const express = require("express");
const {
  createAVideo,
  getAllVideos,
  editAVideo,
  deleteAVideo,
} = require("../../controllers/videoController");
const router = express.Router();

// create a video
// /api/post/video/create
// post request
router.post("/create", createAVideo);

// get all videos
// /api/post/video/explore
// get request
router.get("/explore", getAllVideos);

// edit video
// /api/post/video/edit/{videoId}
// put request
router.put("/edit.:id", editAVideo);

// delete a video
// /api/post/video/delete/{videoId}
// delete request
router.delete("/delete/:id", deleteAVideo);

module.exports = router;
