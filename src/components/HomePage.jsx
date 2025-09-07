// updated
import React from "react";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Plan Smarter, Travel Better{" "}
            <span className="accent">with KoalaRoute AI</span>
          </h1>
          <p className="hero-description">
            Your intelligent travel companion that simplifies trip planning.
            Compare flights, book hotels, and organize your itinerary—all in one
            place with AI-powered recommendations.
          </p>
          <div className="cta-buttons">
            <button
              className="cta-primary"
              onClick={() => (window.location.href = "./KoalaRoute")}
            >
              Get started
            </button>
            {/* <button className="cta-secondary">Watch Demo</button> */}
          </div>
        </div>
        <div className="hero-visual">
          <div className="mockup-container">
            <div className="mockup-screen">
              <div className="screen-header">
                <div className="screen-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="screen-content">
                <div className="destination-card">
                  <div className="card-header">
                    <span>🌏</span>
                    <h4>Bali Trip</h4>
                  </div>
                  <div className="card-dates">Aug 15-25, 2023</div>
                  <div className="card-progress">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                    <span>80% planned</span>
                  </div>
                </div>
                <div className="recommendation">
                  <div className="rec-icon">✈️</div>
                  <div className="rec-text">
                    <p>Flight recommendations ready!</p>
                    <span>Save up to 25% on selected routes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why travelers love KoalaRoute AI</h2>
          <p>Everything you need for stress-free travel planning</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Planning</h3>
            <p>
              Get personalized recommendations based on your preferences,
              budget, and travel style.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💸</div>
            <h3>Best Price Finder</h3>
            <p>
              Compare prices across hundreds of sites to ensure you always get
              the best deals.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗓️</div>
            <h3>Smart Itineraries</h3>
            <p>
              Automatically organized daily plans that maximize your time at
              each destination.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Global Coverage</h3>
            <p>
              Plan trips to thousands of destinations worldwide with
              comprehensive local information.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>Hear from our travelers</h2>
          <p>Join thousands of satisfied users worldwide</p>
        </div>
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "KoalaRoute AI saved me 10+ hours of research and found hidden
                gems I would've missed otherwise!"
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👩</div>
              <div className="author-details">
                <h4>Sarah Johnson</h4>
                <p>Traveled to 12 countries</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "The price comparison feature alone is worth it. Saved over $400
                on my last trip to Europe!"
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👨</div>
              <div className="author-details">
                <h4>Michael Chen</h4>
                <p>Business traveler</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to plan your next adventure?</h2>
          <p>
            Join thousands of travelers using KoalaRoute AI to create
            unforgettable trips
          </p>
          <button
            className="cta-large"
            onClick={() => (window.location.href = "./KoalaRoute")}
          >
            Get Started For Free
          </button>
        </div>
      </section>
    </div>
  );
}
