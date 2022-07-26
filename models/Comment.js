const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    sentFromId: {
      type: String,
      require: true,
    },
    videoId: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);
