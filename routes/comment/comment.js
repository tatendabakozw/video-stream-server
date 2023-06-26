const express = require("express");
const { requireUserSignIn } = require("../../middleware/auth");
const Comment = require("../../models/Comment");
const User = require("../../models/User");
const Video = require("../../models/Video");
const router = express.Router();

// create a comment
// /api/comment/create
// post request
router.post("/create", requireUserSignIn, async (req, res, next) => {
  const { videoId, comment } = req.body;
  const _user = req.user;
  try {
    if (!comment) {
      return res.status(400).send({ message: "You cant put an empty comment" });
    }
    const newComment = Comment({
      comment: comment,
      videoId: videoId,
      sentFromId: _user._id,
    });
    const saved_comment = await newComment.save();

    const comment_user = await User.findOne({_id: saved_comment.sentFromId})

    const comment_obj = {
      comment: saved_comment.comment,
      createdAt: saved_comment.createdAt,
      creator:{
        _id: comment_user._id,
        email: comment_user.email,
        photoURL: comment_user.photoURL,
        username: comment_user.username,
      },
      videoId: saved_comment.videoId,
      sentFromId: saved_comment.sentFromId
    }
    
    return res
      .status(200)
      .send({
        message: "Comment Saved",
        comment: comment_obj,
      });

  } catch (error) {
    next(error)
  }
});

// get all comments
router.get("/all", async (req, res) => {
  try {
    let query = [
      {
        $lookup: {
          from: "users",
          let: { user: "sentFromId" },
          pipeline: [{ $limit: 1 }],
          as: "creator",
        },
      },
      { $unwind: "$creator" },
    ];

    // category wise filtration // should send slug
    if (req.query.videoId) {
      query.push({
        //@ts-ignore
        $match: {
          videoId: req.query.videoId,
        },
      });
    }

    // handling pagination
    let total = await Comment.countDocuments(query);
    //@ts-ignore
    let page = req.query.page ? parseInt(req.query.page) : 1;
    //@ts-ignore
    let perPage = req.query.perPage ? parseInt(req.query.perPage) : 8;
    let skip = (page - 1) * perPage;

    query.push({
      //@ts-ignore
      $skip: skip,
    });
    query.push({
      //@ts-ignore
      $limit: perPage,
    });

    // exclude some fields
    query.push({
      //@ts-ignore
      $project: {
        "creator.password": 0,
      },
    });

    const comments = await Comment.aggregate(query);
    return res
      .status(200)
      .send({
        message: "comments captured",
        comments: comments,
        total_comments: total,
      });
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
});

module.exports = router;
