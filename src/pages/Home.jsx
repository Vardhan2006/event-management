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
    <div className="container stack-lg" style={{ paddingTop: 40, paddingBottom: 64 }}>
      {/* Hero Frame */}
      <section className="hero-frame frame-corner-brackets">
        <span className="eyebrow">Host Your Next Event With Confidence</span>
        <h1 className="hero-headline">
          Discover and Book the Perfect Venue — Effortlessly
        </h1>
        <p className="hero-subtext">
          No more visiting multiple places. Compare venues, check availability, and request bookings in minutes.
          Connecting venue owners and event organizers seamlessly.
        </p>

        <div className="hero-actions">
          <Link to="/venues" className="btn btn-primary btn-lg">
            Browse venues
          </Link>
          <Link to="/register" className="btn btn-accent btn-lg">
            Get started <span>→</span>
          </Link>
        </div>
      </section>

      {/* 3-Column Pastel Gradient Feature Cards */}
      <section className="section-sm">
        <div className="grid-3">
          <div className="card-pastel-green card-hover" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
            <span className="eyebrow" style={{ color: "var(--ink)" }}>Discovery</span>
            <h3 style={{ fontSize: 24, fontWeight: 800 }}>Smart Venue Search</h3>
            <p style={{ color: "rgba(10, 10, 11, 0.8)", fontSize: 15, flex: 1 }}>
              Browse curated venues with filters for location, capacity, price, and amenities. Find your perfect space in seconds.
            </p>
            <div style={{ height: 1, backgroundColor: "var(--ink)", opacity: 0.2 }} />
            <Link to="/venues" className="row" style={{ fontWeight: 700, fontSize: 14 }}>
              Explore venues <span>→</span>
            </Link>
          </div>

          <div className="card-pastel-purple card-hover" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
            <span className="eyebrow" style={{ color: "var(--ink)" }}>Transparency</span>
            <h3 style={{ fontSize: 24, fontWeight: 800 }}>Clear Pricing & Dates</h3>
            <p style={{ color: "rgba(10, 10, 11, 0.8)", fontSize: 15, flex: 1 }}>
              Check real-time availability calendars and transparent daily pricing without hidden fees or surprise costs.
            </p>
            <div style={{ height: 1, backgroundColor: "var(--ink)", opacity: 0.2 }} />
            <Link to="/venues" className="row" style={{ fontWeight: 700, fontSize: 14 }}>
              Check availability <span>→</span>
            </Link>
          </div>

          <div className="card-pastel-peach card-hover" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
            <span className="eyebrow" style={{ color: "var(--ink)" }}>For Owners</span>
            <h3 style={{ fontSize: 24, fontWeight: 800 }}>Owner Dashboard</h3>
            <p style={{ color: "rgba(10, 10, 11, 0.8)", fontSize: 15, flex: 1 }}>
              List your space, manage booking requests, track venue stats, and approve incoming requests with ease.
            </p>
            <div style={{ height: 1, backgroundColor: "var(--ink)", opacity: 0.2 }} />
            <Link to="/owner-dashboard" className="row" style={{ fontWeight: 700, fontSize: 14 }}>
              List a venue <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Checklist Block with Pastel Circles */}
      <section className="checklist-block">
        <div className="stack-sm" style={{ textAlign: "center", marginBottom: 32 }}>
          <span className="eyebrow">Why Choose EventFlow</span>
          <h2>Streamlined Venue Booking</h2>
          <p className="text-muted" style={{ maxWidth: 600, margin: "0 auto" }}>
            Our platform simplifies every step of venue reservation for event hosts and property owners alike.
          </p>
        </div>

        <div className="checklist-grid">
          <div className="checklist-item">
            <div className="check-circle" style={{ backgroundColor: "var(--status-approved-bg)" }}>✓</div>
            <div>
              <strong style={{ display: "block", fontSize: 16 }}>Smart Venue Discovery</strong>
              <p className="text-muted text-sm">Filter by capacity, price, location, and key features effortlessly.</p>
            </div>
          </div>

          <div className="checklist-item">
            <div className="check-circle" style={{ backgroundColor: "#EBDCF7" }}>✓</div>
            <div>
              <strong style={{ display: "block", fontSize: 16 }}>Clear Pricing</strong>
              <p className="text-muted text-sm">Transparent daily rates with zero hidden charges or extra commission.</p>
            </div>
          </div>

          <div className="checklist-item">
            <div className="check-circle" style={{ backgroundColor: "#FCE6CE" }}>✓</div>
            <div>
              <strong style={{ display: "block", fontSize: 16 }}>Faster Decision-Making</strong>
              <p className="text-muted text-sm">Detailed venue specs, photos, and live availability calendars.</p>
            </div>
          </div>

          <div className="checklist-item">
            <div className="check-circle" style={{ backgroundColor: "#D6ECFB" }}>✓</div>
            <div>
              <strong style={{ display: "block", fontSize: 16 }}>Instant Booking Requests</strong>
              <p className="text-muted text-sm">Submit date reservation requests directly to venue managers.</p>
            </div>
          </div>

          <div className="checklist-item">
            <div className="check-circle" style={{ backgroundColor: "#F9DCE8" }}>✓</div>
            <div>
              <strong style={{ display: "block", fontSize: 16 }}>Real-Time Status Tracking</strong>
              <p className="text-muted text-sm">Track pending, approved, or rejected requests live on your dashboard.</p>
            </div>
          </div>

          <div className="checklist-item">
            <div className="check-circle" style={{ backgroundColor: "#D3F2E8" }}>✓</div>
            <div>
              <strong style={{ display: "block", fontSize: 16 }}>Comprehensive Owner Tools</strong>
              <p className="text-muted text-sm">Manage multiple venue listings, pricing, and guest requests seamlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Venues Section */}
      <section className="section-sm stack">
        <div className="row-between">
          <div>
            <span className="eyebrow">Explore Venues</span>
            <h2 style={{ fontSize: 32 }}>Featured Venues</h2>
            <p className="text-muted">Popular spaces available for booking right now.</p>
          </div>
          <Link to="/venues" className="btn btn-secondary">
            View all venues <span>→</span>
          </Link>
        </div>

        {loading && <Loader label="Loading featured venues..." />}
        {!loading && (
          <div className="grid-3">
            {featured.map((venue) => (
              <VenueCard
                key={venue?._id || venue?.id}
                venue={venue}
              />
            ))}
          </div>
        )}
      </section>

      {/* Dark CTA Band */}
      <section className="dark-section frame-corner-brackets stack" style={{ textAlign: "center", alignItems: "center" }}>
        <span className="eyebrow" style={{ color: "var(--muted-on-dark)" }}>Get Started Today</span>
        <h2 style={{ color: "#FFFFFF", fontSize: "clamp(32px, 4vw, 48px)", maxWidth: 700 }}>
          Ready to Host Your Next Unforgettable Event?
        </h2>
        <p style={{ color: "var(--muted-on-dark)", maxWidth: 540 }}>
          Join thousands of organizers and venue owners using EventFlow to connect and book amazing spaces.
        </p>
        <div className="row-wrap" style={{ justifyContent: "center", gap: 16, marginTop: 8 }}>
          <Link to="/register" className="btn btn-accent btn-lg">
            Create Free Account <span>→</span>
          </Link>
          <Link to="/venues" className="btn btn-secondary btn-lg" style={{ backgroundColor: "transparent", color: "#FFFFFF", borderColor: "#FFFFFF" }}>
            Browse Catalog
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;