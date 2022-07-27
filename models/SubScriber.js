const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    channel_id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Subscriber", subscriberSchema);
