const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    item_id: {
      type: String,
      required: [true, "item id is required"],
    },
    type: {
      type: String,
      enum: ["video", "comment"],
    },
    user_id: {
      type: String,
      required: [true, "Please login to perform task"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("like", likeSchema);
