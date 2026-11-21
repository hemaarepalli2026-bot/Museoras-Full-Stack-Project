
require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./User");
const Artwork = require("./Artwork");
const Review = require("./Review");
const Order = require("./Order");

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(express.json());

// SERVE ARTWORK IMAGES
app.use(
  "/images",
  express.static(path.join(__dirname, "../frontend/public/images"))
);

// CORS CONFIGURATION
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// JWT AUTHENTICATION
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. Please login."
    });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = decoded.userId;
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token."
    });
  }
};

// HOME ROUTE
app.get("/", (req, res) => {
  res.send("Museoras Backend is Running!");
});

// GET ARTWORKS
app.get("/api/artworks", async (req, res) => {
  try {
    const artworks = await Artwork.find();
    res.json(artworks);

  } catch (error) {
    console.error("Artwork error:", error);

    res.status(500).json({
      message: "Error fetching artworks"
    });
  }
});

// SUBMIT REVIEW
app.post("/api/reviews", async (req, res) => {
  try {
    const { artworkId, userName, review } = req.body;

    if (!artworkId || !userName || !review || !review.trim()) {
      return res.status(400).json({
        message: "Please fill all review fields."
      });
    }

    await Review.create({
      artworkId,
      userName,
      review
    });

    res.json({
      message: "Review submitted successfully!"
    });

  } catch (error) {
    console.error("Review error:", error);

    res.status(500).json({
      message: "Error saving review."
    });
  }
});

// PLACE ORDER
app.post("/api/orders", async (req, res) => {
  try {
    const {
      artworkId,
      title,
      artist,
      price,
      customerName
    } = req.body;

    if (!artworkId || !title || !artist || !price) {
      return res.status(400).json({
        message: "Order information is incomplete."
      });
    }

    await Order.create({
      artworkId,
      title,
      artist,
      price,
      customerName: customerName || "Gallery User"
    });

    res.json({
      message: "Order placed successfully!"
    });

  } catch (error) {
    console.error("Order error:", error);

    res.status(500).json({
      message: "Error saving order."
    });
  }
});

// REGISTER USER
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed."
    });
  }
});

// LOGIN USER
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    let passwordValid = false;

    if (user.password.startsWith("$2")) {
      passwordValid = await bcrypt.compare(
        password,
        user.password
      );
    } else {
      passwordValid = password === user.password;

      if (passwordValid) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    if (!passwordValid) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed."
    });
  }
});

// PROTECTED PROFILE ROUTE
app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.json({
      message: "Authorized access successful!",
      user
    });

  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      message: "Error fetching profile."
    });
  }
});

// ARTWORK SEED DATA
const artworks = [
  {
    id: 1,
    title: "Mountain Serenity",
    artist: "Arjun Rao",
    category: "Landscape",
    price: "₹2,500",
    image: "/images/mountain.jpg"
  },
  {
    id: 2,
    title: "Abstract Dreams",
    artist: "Priya Sharma",
    category: "Abstract",
    price: "₹3,200",
    image: "/images/abstract.jpg"
  },
  {
    id: 3,
    title: "Colorful Moments",
    artist: "Rahul Verma",
    category: "Modern Art",
    price: "₹2,800",
    image: "/images/colorful moments.jpg"
  },
  {
    id: 4,
    title: "Golden Sunset",
    artist: "Ananya Reddy",
    category: "Nature",
    price: "₹3,500",
    image: "/images/golden sunset.jpg"
  },
  {
    id: 5,
    title: "Silent Thoughts",
    artist: "Kiran Kumar",
    category: "Portrait",
    price: "₹4,000",
    image: "/images/silent thoughts.jpg"
  },
  {
    id: 6,
    title: "Ocean Waves",
    artist: "Meera Das",
    category: "Nature",
    price: "₹2,900",
    image: "/images/ocean waves.jpg"
  }
];

// ADD ARTWORKS WITHOUT DUPLICATING EXISTING DATA
const addArtworksToDatabase = async () => {
  const count = await Artwork.countDocuments();

  if (count === 0) {
    await Artwork.insertMany(artworks);
    console.log("Six artworks added to MongoDB");
  }

  console.log("Artwork database checked successfully");
};

// THIRD-PARTY API: CLEVELAND MUSEUM OF ART
app.get("/api/art-inspiration", async (req, res) => {
  try {
    const response = await fetch(
      "https://openaccess-api.clevelandart.org/api/artworks/?q=impressionism&has_image=1&cc0=1&limit=6"
    );

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Unable to retrieve artworks from the museum API."
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Art Inspiration API error:", error.message);

    res.status(500).json({
      message: "Art Inspiration service is temporarily unavailable."
    });
  }
});

// CHECK ENVIRONMENT VARIABLES
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing from .env");
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing from .env");
  process.exit(1);
}

// CONNECT DATABASE AND START SERVER
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected successfully");

    await addArtworksToDatabase();

    app.listen(PORT, () => {
      console.log(
        `Museoras server running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
