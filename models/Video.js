const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter a title"],
    },
    description: {
      type: String,
      required: [true, "Please enter a description"],
    },
    author: {
      type: String,
    },
    video: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Please enter a category"],
    },
    numberOfLikes: {
      type: Number,
      default: 0,
    },
    numberOfViews: {
      type: Number,
      default: 0,
    },
    numberOfComments:{
      type:Number, 
      default: 0
    },
    tags:{
      type: Array,
    },
    status:{
      type: String,
      enum:['public', 'private'],
      default: 'public'
    },
    duration:{
      type:String,
      default: ''
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Video", videoSchema);
