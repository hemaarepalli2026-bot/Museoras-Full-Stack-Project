require("dotenv").config();  

const mongoose = require("mongoose");
const User = require("./User");
const Artwork = require("./Artwork");
const Review = require("./Review");
const Order = require("./Order");

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.error("MongoDB connection error:", error));

const express = require("express");

const app = express();

const PORT = 5000;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  next();
});

const artworks = [
  {
    id: 1,
    title: "Mountain Serenity",
    artist: "Arjun Rao",
    category: "Landscape",
    price: "₹2,500",
    image: "/images/mountain.jpg",
  },
  {
    id: 2,
    title: "Abstract Dreams",
    artist: "Priya Sharma",
    category: "Abstract",
    price: "₹3,200",
    image: "/images/abstract.jpg",
  },
  {
    id: 3,
    title: "Colorful Moments",
    artist: "Rahul Verma",
    category: "Modern Art",
    price: "₹2,800",
    image: "/images/colorful moments.jpg",
  },
  {
    id: 4,
    title: "Golden Sunset",
    artist: "Ananya Reddy",
    category: "Nature",
    price: "₹3,500",
    image: "/images/golden sunset.jpg",
  },
  {
    id: 5,
    title: "Silent Thoughts",
    artist: "Kiran Kumar",
    category: "Portrait",
    price: "₹4,000",
    image: "/images/silent thoughts.jpg",
  },
  {
    id: 6,
    title: "Ocean Waves",
    artist: "Meera Das",
    category: "Nature",
    price: "₹2,900",
    image: "/images/ocean waves.jpg",
  },
];

app.get("/", (req, res) => {
  res.send("ArtVista Backend is Running!");
});

app.get("/api/artworks", async (req, res) => {
  try {
    const artworks = await Artwork.find();
    res.json(artworks);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching artworks",
    });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const { artworkId, userName, review } = req.body;

    if (!artworkId || !userName || !review) {
      return res.json({
        message: "Please fill all review fields.",
      });
    }

    await Review.create({
      artworkId,
      userName,
      review,
    });

    res.json({
      message: "Review submitted successfully!",
    });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({
      message: "Error saving review.",
    });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { artworkId, title, artist, price, customerName } = req.body;

    if (!artworkId || !title || !artist || !price) {
      return res.json({
        message: "Order information is incomplete.",
      });
    }

    await Order.create({
      artworkId,
      title,
      artist,
      price,
      customerName: customerName || "Gallery User",
    });

    res.json({
      message: "Order placed successfully!",
    });
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({
      message: "Error saving order.",
    });
  }
});

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({
      message: "Please fill all fields.",
    });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.json({
      message: "User already exists.",
    });
  }

  await User.create({
    name,
    email,
    password,
  });

  console.log("New user registered:", email);

  res.json({
    message: "Registration successful!",
  });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt:", email);

  const user = await User.findOne({ email, password });

  if (user) {
    res.json({
      message: "Login successful!",
    });
  } else {
    res.json({
      message: "Invalid email or password.",
    });
  }
});

const addArtworksToDatabase = async () => {
  const count = await Artwork.countDocuments();

  if (count === 0) {
    await Artwork.insertMany(artworks);
    console.log("Artworks added to MongoDB");
  }
};

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  await addArtworksToDatabase();

  await Artwork.updateOne(
    { id: 5 },
    { $set: { image: "/images/silent thoughts.jpg" } }
  );

  console.log("5th painting image updated");
});