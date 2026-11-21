
import { useEffect, useState } from "react";

function ArtInspiration() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/art-inspiration"
        );

        if (!response.ok) {
          throw new Error("Unable to fetch artworks");
        }

        const result = await response.json();

        const publicArtworks = (result.data || []).filter(
          (artwork) => artwork.images?.web?.url
        );

        setArtworks(publicArtworks);

      } catch (err) {
        console.error("Art Inspiration error:", err);
        setError("Art inspiration is temporarily unavailable.");

      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  return (
    <section className="art-inspiration" id="art-inspiration">
      <h2>Art Inspiration</h2>

      <p>
        Discover beautiful public-domain artworks from the Cleveland Museum of Art.
      </p>

      {loading && <p>Loading artworks...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && artworks.length === 0 && (
        <p>No artworks are currently available.</p>
      )}

      <div className="inspiration-grid">
        {artworks.map((artwork) => {
          const artist = artwork.creators?.find(
            (creator) => creator.role === "artist"
          );

          return (
            <div className="inspiration-card" key={artwork.id}>
              <img
                src={artwork.images.web.url}
                alt={artwork.title}
              />

              <h3>{artwork.title}</h3>

              <p>
                {artist?.description || "Artist information unavailable"}
              </p>

              <small>
                {artwork.creation_date || "Date unavailable"}
              </small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ArtInspiration;
