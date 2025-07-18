import React from 'react';
import { FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const whatsappLink = "https://wa.me/233552017649";
  
  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you</p>
      </div>
      
      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <FaEnvelope className="contact-icon" />
            <h3>Email</h3>
            <p>elinart90@gmail.com</p>
          </div>
          <div className="info-card">
            <FaPhone className="contact-icon" />
            <h3>Phone</h3>
            <p>+233 55 2017 649</p>
          </div>
          <div className="info-card">
            <FaMapMarkerAlt className="contact-icon" />
            <h3>Address</h3>
            <p>Tarkwa, Tamso Estate, WT-0042-1324</p>
          </div>
          <div className="info-card whatsapp-card">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp className="contact-icon whatsapp-icon" />
              <h3>WhatsApp</h3>
              <p>Chat with us</p>
            </a>
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