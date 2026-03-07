import { Link } from "react-router-dom";
import EventCard from "../components/events/EventCard";
import { MOCK_EVENTS } from "../utils/constants";

function Home() {
  const featured = MOCK_EVENTS.slice(0, 3);

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
            <Link to="/events" className="btn btn-primary">
              Browse upcoming events
            </Link>
            <Link to="/create-event" className="btn btn-secondary">
              Create an event
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
            <h2 className="page-title">Featured events</h2>
            <p className="page-subtitle">
              Hand-picked experiences you can join this month.
            </p>
          </div>
          <Link to="/events" className="btn btn-secondary">
            View all events
          </Link>
        </div>
        <div className="grid grid-3">
          {featured.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;