//=================================
//             Likes DisLikes
//=================================

const express = require("express");
const { requireUserSignIn } = require("../../middleware/auth");
const Like = require("../../models/Like");
const Video = require("../../models/Video");
const router = express.Router();

// get all video likes on a video
// get request
// /api/like/all/{videoId}
router.get("/video/all/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    // find all likes in the video
    const likes = await Like.find({ item_id: id, type: "video" });

    // check if user is logged in
    if (user_id) {
      // finding if user liked the video or not
      const user_liked = await Like.findOne({
        item_id: id,
        type: "video",
        user_id: user_id,
      });
      return res
        .status(200)
        .send({ likes: likes.length, user_liked: user_liked ? true : false });
    } else {
      return res.status(200).send({ likes: likes.length });
    }
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
});

// like a video
// post request
// /api/like/add
router.post("/add", requireUserSignIn, async (req, res) => {
  const { item_id, type } = req.body;
  const _user = req.user;
  try {
    // add like to a video
    // check if like is already avaible
    // remove like if it already exists
    if (type === "video") {
      const liked = await Like.findOne({
        item_id: item_id,
        user_id: _user._id,
        type: "video",
      });
      if (liked) {
        // remove like
        const removed_like = await Like.findOneAndRemove({
          item_id: item_id,
          type: type,
          user_id: _user._id,
        });
        // find all likes in the video
        const likes = await Like.find({ item_id: item_id, type: "video" });
        await Video.findOneAndUpdate(
            { _id: item_id },
            { $inc: { 'numberOfLikes': -1 } }
          );
        global.io.sockets.emit("like_removed", { likes: likes.length });
        return res
          .status(200)
          .send({ message: "Disliked!", like: removed_like });
      } else {
        // add like
        const newLike = new Like({
          item_id,
          type,
          user_id: _user._id,
        });

        // save document of likes
        const saved_like = await newLike.save();
        // find all likes in the video
        const likes = await Like.find({ item_id: item_id, type: "video" });
        // increase number of likes by one
        await Video.findOneAndUpdate(
          { _id: item_id },
          { $inc: { 'numberOfLikes': 1 } }
        );
        global.io.sockets.emit("like_added", { likes: likes.length });
        return res
          .status(200)
          .send({ message: "Like added!", like: saved_like });
      }
    }
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
});

// remove a like
// post request
// /api/like/dislike
router.post("/dislike", requireUserSignIn, async (req, res) => {
  console.log("removed a like");
});

module.exports = router;
