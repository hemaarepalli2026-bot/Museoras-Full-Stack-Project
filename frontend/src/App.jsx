
import { useState } from "react";
import { useGetArtworksQuery } from "./features/artworks/artworksApi";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ArtInspiration from "./components/ArtInspiration";

const API_URL = "http://localhost:5000";

function App() {
  const [page, setPage] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [cart, setCart] = useState([]);

  // FETCH ARTWORKS USING REDUX TOOLKIT QUERY
  const {
    data: artworks = [],
    isLoading: loading,
    isError: hasError,
  } = useGetArtworksQuery();

  const error = hasError
    ? "Unable to connect to the gallery."
    : "";

  // IMAGE URL
  const getImageUrl = (image) => {
    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // LOGIN PAGE
  if (page === "login") {
    return (
      <Login
        onBack={() => setPage("home")}
        onRegister={() => setPage("register")}
      />
    );
  }

  // REGISTER PAGE
  if (page === "register") {
    return (
      <Register
        onBack={() => setPage("login")}
      />
    );
  }

  // CART PAGE
  if (page === "cart") {
    return (
      <div className="app">
        <section className="art-detail">
          <div className="detail-info">
            <h1>Shopping Cart</h1>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              cart.map((item, index) => (
                <div key={`${item.id}-${index}`}>
                  <h3>{item.title}</h3>
                  <p>By {item.artist}</p>
                  <h2>{item.price}</h2>

                  <button
                    className="view-btn"
                    onClick={() =>
                      setCart(
                        cart.filter(
                          (_, i) => i !== index
                        )
                      )
                    }
                  >
                    Remove from Cart
                  </button>
                </div>
              ))
            )}

            {cart.length > 0 && (
              <button
                className="view-btn"
                onClick={async () => {
                  try {
                    for (const item of cart) {
                      const response = await fetch(
                        `${API_URL}/api/orders`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            artworkId: item.id,
                            title: item.title,
                            artist: item.artist,
                            price: item.price,
                            customerName: "Gallery User",
                          }),
                        }
                      );

                      if (!response.ok) {
                        throw new Error("Order failed");
                      }
                    }

                    alert("Order placed successfully!");
                    setCart([]);
                  } catch (err) {
                    console.error(err);
                    alert("Order failed. Please try again.");
                  }
                }}
              >
                🛍️ Checkout
              </button>
            )}

            <button
              className="view-btn"
              onClick={() => setPage("home")}
            >
              ← Back to Gallery
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ARTWORK DETAILS
  if (selectedArtwork) {
    return (
      <div className="app">
        <section className="art-detail">
          <div className="detail-image">
            <img
              src={getImageUrl(selectedArtwork.image)}
              alt={selectedArtwork.title}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="detail-info">
            <p className="category">
              {selectedArtwork.category}
            </p>

            <h1>{selectedArtwork.title}</h1>
            <h3>By {selectedArtwork.artist}</h3>

            <p>
              Explore this beautiful artwork created by a
              talented artist and discover its unique
              artistic style.
            </p>

            <h2>{selectedArtwork.price}</h2>

            <button
              className="view-btn"
              onClick={() =>
                alert("Artwork added to favorites!")
              }
            >
              ❤️ Add to Favorites
            </button>

            <button
              className="view-btn"
              onClick={() => {
                setCart([...cart, selectedArtwork]);
                alert("Artwork added to cart!");
              }}
            >
              🛒 Add to Cart
            </button>

            <div className="review-box">
              <h3>Write a Review</h3>

              <textarea
                id="reviewText"
                placeholder="Write your review..."
                rows="4"
              />

              <button
                className="view-btn"
                onClick={async () => {
                  const reviewText =
                    document.getElementById("reviewText").value;

                  if (!reviewText.trim()) {
                    alert("Please write a review first.");
                    return;
                  }

                  try {
                    const response = await fetch(
                      `${API_URL}/api/reviews`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          artworkId: selectedArtwork.id,
                          userName: "Gallery User",
                          review: reviewText,
                        }),
                      }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(data.message);
                    }

                    alert(data.message || "Review submitted!");
                    document.getElementById("reviewText").value = "";
                  } catch (err) {
                    console.error(err);
                    alert("Review submission failed.");
                  }
                }}
              >
                Submit Review
              </button>
            </div>

            <button
              className="view-btn"
              onClick={() => setSelectedArtwork(null)}
            >
              ← Back to Gallery
            </button>
          </div>
        </section>
      </div>
    );
  }

  // FILTER ARTWORKS
  const filteredArtworks = artworks.filter((artwork) => {
    const matchesSearch =
      artwork.title?.toLowerCase().includes(search.toLowerCase()) ||
      artwork.artist?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      artwork.category === category;

    return matchesSearch && matchesCategory;
  });

  // HOME PAGE
  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">Museoras</div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#gallery">Gallery</a>
          <a href="#artists">Artists</a>
          <a href="#about">About</a>

          <button
            className="cart-nav-btn"
            onClick={() => setPage("cart")}
          >
            🛒 Cart ({cart.length})
          </button>

          {loggedIn && (
            <button
              className="cart-nav-btn"
              onClick={() => {
                setLoggedIn(false);
                setPage("home");
              }}
            >
              Logout
            </button>
          )}
        </div>

        {!loggedIn && (
          <button
            className="login-btn"
            onClick={() => setPage("login")}
          >
            Login
          </button>
        )}
      </nav>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="small-title">
            WELCOME TO MUSEORAS
          </p>

          <h1>
            Where Art
            <br />
            Finds Its Story
          </h1>

          <p className="hero-text">
            Explore beautiful artworks created by talented
            artists and discover art that speaks to you.
          </p>

          <a href="#gallery">
            <button className="explore-btn">
              Explore Gallery
            </button>
          </a>
        </div>
      </section>

      {/* GALLERY */}
      <section className="gallery" id="gallery">
        <h2>Featured Artworks</h2>

        <p className="section-text">
          Explore beautiful artworks from talented artists.
        </p>

        <input
          type="text"
          placeholder="Search artworks..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="search-box"
        />

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
          className="category-filter"
        >
          <option value="All">All Categories</option>
          <option value="Landscape">Landscape</option>
          <option value="Abstract">Abstract</option>
          <option value="Modern Art">Modern Art</option>
          <option value="Nature">Nature</option>
          <option value="Portrait">Portrait</option>
        </select>

        {loading && (
          <p>Loading artworks...</p>
        )}

        {error && (
          <p>{error}</p>
        )}

        {!loading && !error && (
          <div className="art-grid">
            {filteredArtworks.map((artwork) => (
              <div
                className="art-card"
                key={artwork._id || artwork.id}
              >
                <div className="art-image">
                  <img
                    src={getImageUrl(artwork.image)}
                    alt={artwork.title}
                    onError={(e) => {
                      console.error(
                        "Image not found:",
                        e.currentTarget.src
                      );
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div className="art-info">
                  <h3>{artwork.title}</h3>

                  <p>By {artwork.artist}</p>

                  <p className="category">
                    {artwork.category}
                  </p>

                  <div className="art-bottom">
                    <span>{artwork.price}</span>

                    <button
                      className="view-btn"
                      onClick={() =>
                        setSelectedArtwork(artwork)
                      }
                    >
                      View Art
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredArtworks.length === 0 && (
          <p>No artworks found.</p>
        )}
      </section>

      {/* ARTISTS */}
      <section className="artists" id="artists">
        <h2>Our Artists</h2>

        <p>
          Meet the talented artists behind the artworks
          in our gallery.
        </p>

        <div className="artist-list">
          <div className="artist-card">
            <div className="artist-avatar">AR</div>
            <h3>Arjun Rao</h3>
            <p>Landscape Artist</p>
            <span>
              Specializes in natural landscapes and scenic paintings.
            </span>
          </div>

          <div className="artist-card">
            <div className="artist-avatar">PS</div>
            <h3>Priya Sharma</h3>
            <p>Abstract Artist</p>
            <span>
              Creates expressive and imaginative abstract artworks.
            </span>
          </div>

          <div className="artist-card">
            <div className="artist-avatar">RV</div>
            <h3>Rahul Verma</h3>
            <p>Modern Artist</p>
            <span>
              Known for colorful and contemporary artistic styles.
            </span>
          </div>

          <div className="artist-card">
            <div className="artist-avatar">AR</div>
            <h3>Ananya Reddy</h3>
            <p>Nature Artist</p>
            <span>
              Creates beautiful artworks inspired by nature.
            </span>
          </div>

          <div className="artist-card">
            <div className="artist-avatar">KK</div>
            <h3>Kiran Kumar</h3>
            <p>Portrait Artist</p>
            <span>
              Focuses on expressive portrait and character artwork.
            </span>
          </div>

          <div className="artist-card">
            <div className="artist-avatar">MD</div>
            <h3>Meera Das</h3>
            <p>Nature Artist</p>
            <span>
              Creates peaceful artworks inspired by oceans and nature.
            </span>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="about">
        <h2>About Our Gallery</h2>

        <p>
          Museoras is an online art gallery where artists
          can showcase their artworks and art lovers can
          discover, explore and purchase beautiful artwork.
        </p>
      </section>

      {/* THIRD-PARTY API - ART INSPIRATION */}
      <ArtInspiration />


      {/* FOOTER */}
      <footer>
        <p>© 2026 Museoras. All Rights Reserved.</p>
      </footer>

    </div>
  );
}

export default App;
