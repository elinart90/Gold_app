import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About Our Gold App</h1>
        <p>Your trusted platform for gold investments</p>
      </div>
      
      <div className="about-content">
        <section className="about-section">
          <h2>Our Story</h2>
          <p>Founded in 2020, we set out to democratize gold investment by making it accessible to everyone...</p>
        </section>
        
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>To provide secure, transparent, and easy-to-use gold trading platform...</p>
        </section>
        
        <div className="team-section">
          <h2>Meet the Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar"></div>
              <h3>John Smith</h3>
              <p>Founder & CEO</p>
            </div>
            {/* Add more team members */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;