import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you</p>
      </div>
      
      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <h3>Email</h3>
            <p>support@goldapp.com</p>
          </div>
          <div className="info-card">
            <h3>Phone</h3>
            <p>+1 (800) 123-4567</p>
          </div>
          <div className="info-card">
            <h3>Address</h3>
            <p>123 Gold Street, Financial District, NY 10001</p>
          </div>
        </div>
        
        <form className="contact-form">
          <h2>Send us a message</h2>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" placeholder="Your name" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Your email" />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" rows="5" placeholder="Your message"></textarea>
          </div>
          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;