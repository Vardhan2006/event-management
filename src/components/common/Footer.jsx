import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-content">
          <div className="footer-section">
            <h4 className="footer-title">EventFlow</h4>
            <p className="footer-description">
              Discover and book the perfect venue for your events. 
              Connecting venues with organizers seamlessly.
            </p>
            <div className="footer-social">
              <a href="#!" className="social-link" aria-label="Facebook">
                <span className="social-icon">📘</span>
              </a>
              <a href="#!" className="social-link" aria-label="Twitter">
                <span className="social-icon">🐦</span>
              </a>
              <a href="#!" className="social-link" aria-label="LinkedIn">
                <span className="social-icon">💼</span>
              </a>
              <a href="#!" className="social-link" aria-label="Instagram">
                <span className="social-icon">📷</span>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <div className="footer-links">
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/venues" className="footer-link">Venues</Link>
              <Link to="/owner-dashboard" className="footer-link">Dashboard</Link>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Contact</h4>
            <div className="footer-contact">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <a href="mailto:hello@eventflow.com" className="contact-link">
                  hello@eventflow.com
                </a>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <a href="tel:+1234567890" className="contact-link">
                  +1 (234) 567-890
                </a>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Legal</h4>
            <div className="footer-links">
              <a href="#!" className="footer-link">Terms of Service</a>
              <a href="#!" className="footer-link">Privacy Policy</a>
              <a href="#!" className="footer-link">Cookie Policy</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} EventFlow. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;