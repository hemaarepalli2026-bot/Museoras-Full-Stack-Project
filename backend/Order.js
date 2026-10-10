const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  artworkId: Number,
  title: String,
  artist: String,
  price: String,
  customerName: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;