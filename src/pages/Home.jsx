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
      {/* Hero Section */}
      <section className="hero">
        <div>
          <div className="hero-badge badge">
            <span>New</span>
            <span>Host your next event with confidence</span>
          </div>
          <h1 className="hero-title">
            Discover and Book the Perfect Venue — <span className="hero-highlight">Effortlessly</span>
          </h1>
          <p className="hero-subtitle">
            No more visiting multiple places. Compare venues, check availability, and request bookings in minutes.
          </p>
          <p className="hero-description">
            Our platform brings together venue owners and event organizers in one seamless experience. 
            Browse through curated venues, compare prices and amenities, and send booking requests instantly. 
            Whether you're planning a corporate meeting, wedding, or community event, find your perfect space with just a few clicks.
          </p>

          <div className="hero-benefits">
            <div className="benefit-item">
              <div className="benefit-icon">🔍</div>
              <div className="benefit-text">
                <strong>Smart venue discovery</strong> in one place
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">💰</div>
              <div className="benefit-text">
                <strong>Clear pricing</strong> and real availability
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">⚡</div>
              <div className="benefit-text">
                <strong>Faster decision-making</strong> with detailed info
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">📝</div>
              <div className="benefit-text">
                <strong>Simple booking process</strong> with instant requests
              </div>
            </div>
          </div>

          <div className="hero-actions">
            <Link to="/venues" className="btn btn-primary">
              Browse venues
            </Link>
            <Link to="/owner-dashboard" className="btn btn-secondary">
              List a venue
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-illustration">
            <div className="illustration-card">
              <div className="illust-header">
                <div className="illust-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="illust-title">Venue Search</div>
              </div>
              <div className="illust-content">
                <div className="search-bar">
                  <div className="search-icon">🔍</div>
                  <div className="search-text">Search perfect venue...</div>
                </div>
                <div className="venue-preview">
                  <div className="venue-card-mini">
                    <div className="venue-image-placeholder"></div>
                    <div className="venue-info">
                      <div className="venue-name">Grand Ballroom</div>
                      <div className="venue-price">$2,500/day</div>
                    </div>
                  </div>
                  <div className="venue-card-mini">
                    <div className="venue-image-placeholder"></div>
                    <div className="venue-info">
                      <div className="venue-name">Conference Center</div>
                      <div className="venue-price">$1,800/day</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section">
        <div className="section-header">
          <h2 className="section-title">About Us</h2>
          <p className="section-subtitle">Connecting venues with events seamlessly</p>
        </div>
        
        <div className="about-content">
          <div className="about-intro">
            <p>
              EventFlow was founded with a simple mission: to make venue booking effortless for both event organizers and venue owners. 
              We saw the frustration in the traditional process - endless phone calls, site visits, and uncertain availability. 
              Our platform transforms this experience into a streamlined digital journey.
            </p>
          </div>
          
          <div className="about-grid">
            <div className="about-card">
              <h3>Our Mission</h3>
              <p>
                To revolutionize event planning by providing a seamless platform that connects venue owners with event organizers, 
                making the booking process transparent, efficient, and enjoyable for everyone involved.
              </p>
            </div>
            
            <div className="about-card">
              <h3>Our Vision</h3>
              <p>
                To become the global standard for venue booking, where every event - from corporate conferences to community gatherings - 
                finds its perfect space through our intuitive platform.
              </p>
            </div>
            
            <div className="about-card">
              <h3>Our Values</h3>
              <ul className="values-list">
                <li><strong>Transparency:</strong> Clear pricing and honest information</li>
                <li><strong>Efficiency:</strong> Save time for organizers and owners</li>
                <li><strong>Quality:</strong> Curated venues that meet high standards</li>
                <li><strong>Innovation:</strong> Continuously improving the booking experience</li>
                <li><strong>Community:</strong> Supporting local venues and events</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Features</h2>
          <p className="section-subtitle">Everything you need for perfect venue booking</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Easy Venue Discovery</h3>
            <p>
              Browse through our curated collection of venues with advanced filters for location, capacity, price, and amenities. 
              Find exactly what you need without the hassle.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⏰</div>
            <h3>Real-Time Booking Requests</h3>
            <p>
              Send booking requests instantly and receive real-time updates. No more waiting for email responses - 
              track your request status right from your dashboard.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Owner Dashboard Management</h3>
            <p>
              Venue owners get a comprehensive dashboard to manage listings, track bookings, update availability, 
              and communicate with potential clients - all in one place.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3>Transparent Pricing</h3>
            <p>
              No hidden fees or surprises. See clear pricing information, availability calendars, and detailed venue information 
              before making any booking decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Venues Section */}
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