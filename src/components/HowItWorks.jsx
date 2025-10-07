import React from 'react'
import './HowItWorks.css'

function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Upload Your Image',
      description: 'Choose any photo or image from your device. Our string art generator supports JPG, PNG, and GIF formats. Best results come from high-contrast images with clear subjects like portraits, logos, or geometric designs.',
      icon: '📤'
    },
    {
      number: '2',
      title: 'Crop & Adjust',
      description: 'Use our intuitive cropper to select the perfect circular area. Zoom in, pan, and position your subject precisely. The circular crop matches traditional string art boards for authentic results.',
      icon: '✂️'
    },
    {
      number: '3',
      title: 'Customize Parameters',
      description: 'Fine-tune your string art with customizable settings: adjust pins (50-500), lines (up to 5000), line weight, and enable advanced features like edge detection for professional-quality thread art patterns.',
      icon: '⚙️'
    },
    {
      number: '4',
      title: 'Generate Pattern',
      description: 'Our advanced algorithm analyzes your image using edge detection and greedy optimization to calculate the optimal sequence of lines. Watch in real-time as the pattern is generated with step-by-step visualization.',
      icon: '✨'
    },
    {
      number: '5',
      title: 'Export & Create',
      description: 'Download your string art as a high-quality PNG image or export the pin coordinates as JSON for physical recreation. Use the data to create real nail and thread art on wood boards.',
      icon: '💾'
    }
  ]

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-container">
        <h2>How to Create String Art Online - Step by Step Guide</h2>
        <p className="how-subtitle">
          Our free string art generator makes it easy to transform any photo into a beautiful thread art pattern.
          Follow these simple steps to create stunning DIY wall art in minutes.
        </p>

        <div className="steps-grid">
          {steps.map((step) => (
            <div key={step.number} className="step-card">
              <div className="step-header">
                <span className="step-icon">{step.icon}</span>
                <span className="step-number">Step {step.number}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>

        <div className="how-cta">
          <h3>Ready to Create Your String Art?</h3>
          <p>Start generating beautiful thread art patterns for free - no registration required!</p>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
