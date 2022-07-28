// subscribe to a channel
// /post request

const SubScriber = require("../models/SubScriber");

// /api/subscribe/toggle
exports.toggleSubcribe = async (req, res) => {
  const { channel_id } = req.body;
  const _user = req.user;
  try {
    // add like to a video
    // check if like is already avaible
    // remove like if it already exists
    const subscribed = await SubScriber.findOne({
      channel_id: channel_id,
      user_id: _user._id,
    });
    if (subscribed) {
      // remove like
      const removed_subscriber = await SubScriber.findOneAndRemove({
        channel_id: channel_id,
        user_id: _user._id,
      });
      // / // find all subscribers of channel
      const subscribers = await SubScriber.countDocuments({ channel_id: channel_id });

      //   await User.findOneAndUpdate(
      //       { _id: channel_id },
      //       { $inc: { 'numberOfLikes': -1 } }
      //     );
      global.io.sockets.emit("un_subscribe", { subscribers: subscribers });
      return res
        .status(200)
        .send({ message: "Un-Subscribed!", subscriber: removed_subscriber });
    } else {
      // add like
      const newSubscriber = new SubScriber({
        channel_id,
        user_id: _user._id,
      });

      // save document of likes
      const saved_like = await newSubscriber.save();
      // find all subscribers of channel
      const subscribers = await SubScriber.countDocuments({ channel_id: channel_id });

      // remove commens below to reduce dubscribers in user document
      // increase number of likes by one
      //   await Video.findOneAndUpdate(
      //     { _id: channel_id },
      //     { $inc: { 'numberOfLikes': 1 } }
      //   );
      global.io.sockets.emit("subscribe", { subscribers: subscribers });
      return res.status(200).send({ message: "Subscribed!", like: saved_like });
    }
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
};

// get all subscribers
// /api/subscribe/all
// get request
exports.getAllSubscribers = async (req, res) => {
  try {
    const { id } = req.params; // id of the channel / author
    const { user_id } = req.query; // the id of the user if logged in

    // find all subscribers of channel
    const subscribers = await SubScriber.countDocuments({ channel_id: id });

    // check if user is logged in
    if (user_id) {
      // finding if user subscribed the video or not
      const user_subscribed = await SubScriber.findOne({
        channel_id: id,
        user_id: user_id,
      });
      return res.status(200).send({
        subscribers: subscribers,
        user_subscribed: user_subscribed ? true : false,
      });
    } else {
      return res.status(200).send({ subscribers: subscribers });
    }
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
};
