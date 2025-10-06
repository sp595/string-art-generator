import React from 'react'
import './LandingHero.css'

function LandingHero({ onGetStarted }) {
  return (
    <section className="landing-hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Create Stunning <span className="highlight">String Art</span> Online
        </h1>
        <p className="hero-subtitle">
          Transform your photos into beautiful thread art patterns. Free, easy-to-use tool with advanced algorithms for professional results.
        </p>

        <div className="hero-features">
          <div className="feature">
            <span className="feature-icon">🎨</span>
            <span>Upload Any Image</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⚙️</span>
            <span>Customize Parameters</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💾</span>
            <span>Export & Download</span>
          </div>
        </div>

        <button className="hero-cta" onClick={onGetStarted}>
          Get Started - It's Free
        </button>

        <p className="hero-note">
          No sign-up required • Works in your browser • Export as JSON or PNG
        </p>
      </div>
    </section>
  )
}

export default LandingHero
