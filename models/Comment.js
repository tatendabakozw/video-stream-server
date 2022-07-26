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
    likes: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);
