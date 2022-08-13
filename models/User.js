const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username field is required"],
    },
    email: {
      type: String,
      required: [true, "Email address field is required"],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "creator", "admin"],
      default: "user",
    },
    emailApproved: {
      type: Boolean,
      default: true,
    },
    terms_agreed: {
      type: Boolean,
      required: true,
      default: false,
    },
    photoURL: {
      type:String, 
      default: ''
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
