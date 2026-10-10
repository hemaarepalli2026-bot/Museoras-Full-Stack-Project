const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema({
  id: Number,
  title: String,
  artist: String,
  category: String,
  price: String,
  image: String,
});

const Artwork = mongoose.model("Artwork", artworkSchema);

module.exports = Artwork;