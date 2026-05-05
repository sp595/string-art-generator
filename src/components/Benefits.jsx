import React from 'react'
import AppIcon from './AppIcon'
import { en } from '../i18n/en'
import './Benefits.css'

function Benefits() {
  const { benefits: benefitsContent } = en
  const benefits = benefitsContent.items

  return (
    <section className="benefits" id="features">
      <div className="benefits-container">
        <span className="benefits-kicker">{benefitsContent.kicker}</span>
        <h2>{benefitsContent.title}</h2>
        <p className="benefits-subtitle">{benefitsContent.subtitle}</p>

        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon"><AppIcon name={benefit.icon} size={22} /></div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="benefits-footer">
          <h3>{benefitsContent.footerTitle}</h3>
          <p>{benefitsContent.footerText}</p>
        </div>
      </div>
    </section>
  )
}

export default Benefits
