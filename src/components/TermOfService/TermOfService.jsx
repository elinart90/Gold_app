import React from 'react';
import './Term.css';

const TermsOfService = () => {
  return (
    <div className="terms-container">
      <div className="terms-header">
        <h1>Terms of Service</h1>
        <p>Last updated: January 1, 2023</p>
      </div>
      
      <div className="terms-content">
        <section className="terms-section">
          <h2>1. Introduction</h2>
          <p>Welcome to Gold App. These Terms of Service govern your use of our platform...</p>
        </section>
        
        <section className="terms-section">
          <h2>2. Account Registration</h2>
          <p>To access certain features, you must register for an account...</p>
        </section>
        
        {/* Add more sections as needed */}
      </div>
    </div>
  );
};

export default TermsOfService;