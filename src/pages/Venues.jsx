import { useEffect, useState } from "react";
import Loader from "../components/common/Loader";
import VenueCard from "../components/venues/VenueCard";
import venueService from "../services/venueService";

function Venues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVenues() {
      try {
        setLoading(true);
        setError("");
        const data = await venueService.getVenues();
        setVenues(Array.isArray(data) ? data : []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        setError("We couldn’t load venues right now. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadVenues();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse venues</h1>
          <p className="page-subtitle">
            Discover spaces and request bookings for your next event.
          </p>
        </div>
      </div>

      {loading && <Loader label="Loading venues..." />}

      {!loading && error && (
        <div className="card">
          <div className="card-title">Something went wrong</div>
          <div className="card-subtitle">{error}</div>
        </div>
      )}

      {!loading && !error && venues.length === 0 && (
        <div className="card">
          <div className="card-title">No venues yet</div>
          <div className="card-subtitle">
            When venue owners add spaces, they&apos;ll appear here.
          </div>
        </div>
      )}

      {!loading && !error && venues.length > 0 && (
        <div className="grid grid-3">
          {venues.map((venue) => (
            <VenueCard key={venue?._id || venue?.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Venues;

