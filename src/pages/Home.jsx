import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "../components/common/Loader";
import VenueCard from "../components/venues/VenueCard";
import venueService from "../services/venueService";

function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await venueService.getVenues();
        setFeatured(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch {
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <div>
          <div className="hero-badge badge">
            <span>New</span>
            <span>Host your next event with confidence</span>
          </div>
          <h1 className="hero-title">
            The modern way to{" "}
            <span className="hero-highlight">plan, host &amp; discover</span>{" "}
            events.
          </h1>
          <p className="hero-subtitle">
            EventFlow helps teams run conferences, meetups, and workshops with a
            professional experience attendees expect from modern platforms.
          </p>

          <div className="hero-actions">
            <Link to="/venues" className="btn btn-primary">
              Browse venues
            </Link>
            <Link to="/owner-dashboard" className="btn btn-secondary">
              List a venue
            </Link>
          </div>

          <div className="hero-meta">
            <div className="hero-stat">
              <span className="hero-stat-value">3k+</span>
              <span>Events published yearly</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">120+</span>
              <span>Cities represented</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">Remote-first</span>
              <span>Online &amp; hybrid support</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-title">Today on EventFlow</div>
            <div className="hero-card-subtitle">
              A snapshot of what&apos;s happening next.
            </div>
            <div className="hero-card-event">
              <div className="hero-card-pill">
                <span>Live soon</span>
                <span>·</span>
                <span>Online</span>
              </div>
              <div style={{ fontWeight: 600, marginTop: 6 }}>
                Remote Engineering Meetup
              </div>
              <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                200+ engineers sharing what works for distributed teams.
              </div>
              <div className="hero-card-footer">
                <span>Starts in 2 hours</span>
                <span className="hero-card-accent">Save your seat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="page-header">
          <div>
            <h2 className="page-title">Featured venues</h2>
            <p className="page-subtitle">
              Popular spaces available for booking.
            </p>
          </div>
          <Link to="/venues" className="btn btn-secondary">
            View all venues
          </Link>
        </div>
        {loading && <Loader label="Loading featured venues..." />}
        {!loading && (
          <div className="grid grid-3">
            {featured.map((venue) => (
              <VenueCard
                key={venue?._id || venue?.id}
                venue={venue}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;