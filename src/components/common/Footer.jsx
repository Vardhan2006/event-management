import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer-shell">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-brand-title">EventFlow</div>
            <p className="footer-tagline">
              Discover and book the perfect venue for your events. Connecting venues with organizers seamlessly.
            </p>
            <div className="footer-socials" style={{ marginTop: 16 }}>
              <a href="#!" className="social-icon-btn" aria-label="Facebook">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="#!" className="social-icon-btn" aria-label="Twitter">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              <a href="#!" className="social-icon-btn" aria-label="LinkedIn">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#!" className="social-icon-btn" aria-label="Instagram">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-nav-col">
              <span className="eyebrow">Quick Links</span>
              <Link to="/">Home</Link>
              <Link to="/venues">Venues</Link>
              <Link to="/owner-dashboard">Dashboard</Link>
            </div>

            <div className="footer-nav-col">
              <span className="eyebrow">Contact</span>
              <a href="mailto:hello@eventflow.com">hello@eventflow.com</a>
              <a href="tel:+1234567890">+1 (234) 567-890</a>
            </div>

            <div className="footer-nav-col">
              <span className="eyebrow">Legal</span>
              <a href="#!">Terms of Service</a>
              <a href="#!">Privacy Policy</a>
              <a href="#!">Cookie Policy</a>
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} EventFlow. All rights reserved.</span>
          <span className="text-muted">Built for modern event management.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;