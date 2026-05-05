import React from 'react'
import AppIcon from './AppIcon'
import { en } from '../i18n/en'
import './HowItWorks.css'

function HowItWorks() {
  const { howItWorks } = en
  const steps = howItWorks.steps

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-container">
        <span className="how-kicker">Workflow</span>
        <h2>{howItWorks.title}</h2>
        <p className="how-subtitle">{howItWorks.subtitle}</p>

        <div className="steps-grid">
          {steps.map((step) => (
            <div key={step.number} className="step-card">
              <div className="step-header">
                <span className="step-icon"><AppIcon name={step.icon} size={20} /></span>
                <span className="step-number">Step {step.number}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>

        <div className="how-cta">
          <h3>{howItWorks.ctaTitle}</h3>
          <p>{howItWorks.ctaText}</p>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
