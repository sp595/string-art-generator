import React from 'react'
import AppIcon from './AppIcon'
import { en } from '../i18n/en'
import './LandingHero.css'

function LandingHero({ onGetStarted }) {
  const { hero } = en

  return (
    <section className="landing-hero" id="features">
      <div className="hero-orbit hero-orbit-left"></div>
      <div className="hero-orbit hero-orbit-right"></div>
      <div className="hero-content">
        <span className="hero-kicker">{hero.kicker}</span>
        <h1 className="hero-title">
          {hero.titlePrefix} <span className="highlight">{hero.titleHighlight}</span> {hero.titleSuffix}
        </h1>
        <p className="hero-subtitle">
          {hero.subtitle}
        </p>

        <div className="hero-features">
          <div className="feature">
            <span className="feature-icon"><AppIcon name="palette" size={18} /></span>
            <span>{hero.features.upload}</span>
          </div>
          <div className="feature">
            <span className="feature-icon"><AppIcon name="sliders" size={18} /></span>
            <span>{hero.features.parameters}</span>
          </div>
          <div className="feature">
            <span className="feature-icon"><AppIcon name="download" size={18} /></span>
            <span>{hero.features.export}</span>
          </div>
        </div>

        <div className="hero-actions">
          <button className="hero-cta" onClick={onGetStarted}>
            {hero.cta}
          </button>
          <span className="hero-microcopy">{hero.microcopy}</span>
        </div>

        <p className="hero-note">
          {hero.note}
        </p>
      </div>
    </section>
  )
}

export default LandingHero
