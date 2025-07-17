// src/components/Layout/Layout.jsx
import {  Link } from 'react-router-dom';
import './Footer.css';

const Layout = () => {
  return (
    <div className="app-container">
      
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-links">
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
            <Link to="/terms" className="footer-link">Terms of Service</Link>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          </div>
          <div className="copyright">
            &copy; {new Date().getFullYear()} GoldTrack GH. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;