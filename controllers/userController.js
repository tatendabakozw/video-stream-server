const bcrypt = require("bcrypt");
const SubScriber = require("../models/SubScriber");
const User = require("../models/User");
const Video = require("../models/Video");

// edit user
// /api/user/edit/{userId}
// put request
exports.editUserInfo = async (req, res, next) => {
  try {
    // get iformation from client
    const {
      username,
      old_password,
      new_password,
      picture_url,
      gender,
      country,
    } = req.body;

    // find if user exists in database
    const { id } = req.params;

    const user = await User.findOne({ _id: id });
    if (!user) {
      res.status(404).send({ message: "Could not find the user" });
      return;
    }

    // check if user is allowed to edit the acciut
    if (req.user._id !== id) {
      res.status(403).send({ message: "You can only edit your account" });
      return;
    }

    if (new_password) {
      // if user wants to edit password
      if (old_password) {
        // decrypt password value from database
        const password_correct = await bcrypt.compare(
          old_password,
          user.password
        );
        // if password decrypted set the new password
        if (password_correct) {
          user.password = bcrypt.hashSync(new_password, 12);
          user.username = username;
          user.photoURL = picture_url;
          user.gender = gender;
          user.country = country;
          await user.save();
          return res.status(200).send({ message: "Account has been updated" });
        } else {
          res.status(403).send({ message: "Old password is incorrect" });
          return;
        }
      } else {
        return res
          .status(403)
          .send({ message: "Please enter your correct old password" });
      }
    }

    user.photoURL = picture_url;
    user.username = username;
    user.gender = gender;
    user.country = country;

    await user.save();
    return res.status(200).send({ message: "Information saved" });

    // the user has been found
  } catch (error) {
    return res.status(500).send({ message: `${error} ` });
  }
};

// get user videos
// get request
// /api/user/videos
// requeres user to be logged in
exports.getUserVideos = async (req, res) => {
  try {
    const _user = req.user;

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
        author: _user._id,
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

// get user information
// get request
// /api/user/info
exports.getUserInfo = async (req, res) => {
  const { user } = req.query;
  try {
    let total_subscribers = await SubScriber.countDocuments({
      channel_id: user,
    });
    let total_videos = await Video.countDocuments({ author: user });
    let user_info = await User.findOne({ _id: user });

    return res.status(200).send({
      subscribers: total_subscribers,
      videos: total_videos,
      user_info: {
        username: user_info.username,
        createdAt: user_info.createdAt,
        email: user_info.email,
        gender: user_info.gender,
        country:user_info.country,
        photoURL: user_info.photoURL
      },
    });
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
};
