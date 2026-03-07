function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>© {new Date().getFullYear()} EventFlow. All rights reserved.</span>
        <div className="footer-links">
          <a href="#!" className="footer-link">
            Help
          </a>
          <a href="#!" className="footer-link">
            Terms
          </a>
          <a href="#!" className="footer-link">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;