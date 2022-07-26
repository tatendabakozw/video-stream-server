// create a video
// /api/post/video/create
// post request
exports.createAVideo = async (req, res) => {
  console.log("create a video");
};

// get all videos
// /api/post/video/explore
// get request
exports.getAllVideos = async (req, res) => {
  console.log("get all videos");
};

// edit video
// /api/post/video/edit/{videoId}
// put request
exports.editAVideo = async (req, res) => {
  console.log("edit a video");
};

// delete a video
// /api/post/video/delete/{videoId}
// delete request
exports.deleteAVideo = async (req, res) => {
  console.log("delete a video");
};
