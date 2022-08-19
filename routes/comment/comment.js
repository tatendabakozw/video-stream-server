const express = require("express");
const { requireUserSignIn } = require("../../middleware/auth");
const Comment = require("../../models/Comment");
const Video = require("../../models/Video");
const router = express.Router();

// create a comment
// /api/comment/create
// post request
router.post("/create", requireUserSignIn, async (req, res) => {
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
    await Video.findOneAndUpdate(
      { _id: videoId },
      { $inc: { 'numberOfComments': 1 } }
    );
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
    query.push({
      $match: {
        _id: saved_comment._id,
      },
    });
    // exclude some fields
    query.push({
      //@ts-ignore
      $project: {
        "creator.password": 0,
      },
    });
    const new_comment = await Comment.aggregate(query)
    console.log(new_comment)
    global.io.sockets.emit("comment", saved_comment);
    return res
      .status(200)
      .send({
        message: "Comment Saved",
        comment: new_comment,
      });

  } catch (error) {
    return res.status(500).send({ message: `${error}` });
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
