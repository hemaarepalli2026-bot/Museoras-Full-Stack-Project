const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  artworkId: Number,
  userName: String,
  review: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;