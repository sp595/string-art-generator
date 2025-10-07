import React from 'react'
import './LandingHero.css'

function LandingHero({ onGetStarted }) {
  return (
    <section className="landing-hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Free String Art Generator - Create Stunning <span className="highlight">Thread Art</span> from Photos
        </h1>
        <p className="hero-subtitle">
          Transform any image into beautiful string art patterns instantly. Our free online string art generator uses advanced edge detection algorithms to create professional DIY nail and thread art designs. Perfect for wall art, home decor, and personalized gifts.
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
