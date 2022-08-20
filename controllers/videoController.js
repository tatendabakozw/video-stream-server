const User = require("../models/User");
const Video = require("../models/Video");

// create a video
// /api/post/video/create
// post request
exports.createAVideo = async (req, res) => {
  const {
    title,
    description,
    category,
    video_url,
    picture_url,
    tags,
    duration,
    status,
  } = req.body;
  const _user = req.user;
  // url to hold the image
  if (!title) {
    return res.status(401).send({ message: "Please enter a title" });
  }
  if (!description) {
    return res.status(401).send({ message: "Please enter a description" });
  }
  if (!video_url) {
    return res.status(401).send({ message: "Please enter a video" });
  }
  try {
    const newVideo = new Video({
      title: title,
      description: description,
      category: category,
      author: _user._id,
      video: video_url,
      thumbnail: picture_url,
      tags: tags,
      duration: duration,
      status: status,
    });
    const saved_video = await newVideo.save();
    return res
      .status(200)
      .send({ message: "Video uploaded succesfully", video: saved_video });
  } catch (error) {
    console.log(`${error}`);
    return res.status(500).send({ message: `${error}` });
  }
};

// get all videos
// /api/post/video/explore
// get request
exports.getAllVideos = async (req, res) => {
  try {
    // handling creator schema
    let query = [
      {
        $lookup: {
          from: "users",
          let: { store: "user" },
          pipeline: [{ $limit: 1 }],
          as: "creator",
        },
      },
      { $unwind: "$creator" },
    ];

    query.push({
      $match: {
        status: "public",
      },
    });

    // handling search queries
    if (req.query.keyword && req.query.keyword != "") {
      query.push({
        //@ts-ignore
        $match: {
          $or: [
            { title: { $regex: req.query.keyword, $options: "i" } },
            { description: { $regex: req.query.keyword, $options: "i" } },
            {
              "creator.username": {
                $regex: req.query.keyword,
                $options: "i",
              },
            },
            { category: { $regex: req.query.keyword, $options: "i" } },
          ],
        },
      });
    }

    // category wise filtration // should send slug
    if (req.query.category) {
      query.push({
        //@ts-ignore
        $match: {
          category: req.query.category,
        },
      });
    }

    // handling pagination
    let total = await Video.countDocuments(query);
    //@ts-ignore
    let page = req.query.page ? parseInt(req.query.page) : 1;
    //@ts-ignore
    let perPage = req.query.perPage ? parseInt(req.query.perPage) : 16;
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
        "creator.username": 0,
        "creator.email": 0,
      },
    });

    // handling sort
    if (req.query.sortBy && req.query.sortOrder) {
      var sort = {};
      //@ts-ignore
      sort[req.query.sortBy] = req.query.sortOrder == "asc" ? 1 : -1;
      query.push({
        //@ts-ignore
        $sort: sort,
      });
    } else {
      query.push({
        //@ts-ignore
        $sort: { createdAt: -1 },
      });
    }


    let videos = await Video.aggregate(query);

    return res.status(200).send({
      message: "Videos fetched sucessfully",
      length: videos.length,
      meta: {
        total: total,
        currentPage: page,
        perPage: perPage,
        totalPages: Math.ceil(total / perPage),
      },
      videos: videos,
    });
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
};

// get a single video
exports.getSingleVideo = async (req, res) => {
  try {
    const { videoId } = req.query;
    const video = await Video.findOne({ _id: videoId });

    // increase number of views by 1
    await Video.findOneAndUpdate(
      { _id: videoId },
      { $inc: { numberOfViews: 1 } }
    );

    const creator = await User.findOne({_id: video.author})

    console.log(creator)

    return res.status(200).send({ video: video, creator: {
      username: creator.username,
      pro_pic: creator.photoURL,
      user_id: creator._id,
      createdAt: creator.createdAt
    } });

  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
};

// edit video
// /api/video/edit/{videoId}
// put request
// required login
exports.editAVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, thumbnail, category } = req.body;

    const _user = req.user;
    const video = await Video.findOne({ _id: id });

    if (_user._id === video.author) {
      video.title = title;
      video.description = description;
      video.status = status;
      video.thumbnail = thumbnail;
      video.category = category;

      await video.save()
      return res.status(200).send({message: 'Video Saved!'})
    } else {
      return res
        .status(403)
        .send({ message: "You are not allowed to edit document" });
    }
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
};

// delete a video
// /api/video/delete/{videoId}
// delete request
exports.deleteAVideo = async (req, res) => {
  const {id} = req.params
  try {
    await Video.findOneAndRemove({_id: id})
    return res.status(200).send({message: 'Video deleted successfully!'})
  } catch (error) {
    return res.status(500).send({message: `${error}`})
  } 
};
