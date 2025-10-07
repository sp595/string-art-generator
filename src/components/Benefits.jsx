import React from 'react'
import './Benefits.css'

function Benefits() {
  const benefits = [
    {
      icon: '🎨',
      title: 'Professional Quality Results',
      description: 'Advanced edge detection and greedy optimization algorithms create stunning, professional-quality string art patterns from any image.'
    },
    {
      icon: '🆓',
      title: '100% Free Forever',
      description: 'No hidden costs, no subscriptions, no watermarks. Create unlimited string art patterns completely free with no registration required.'
    },
    {
      icon: '⚡',
      title: 'Fast & Easy to Use',
      description: 'Upload, customize, and generate in minutes. Intuitive interface with real-time preview and step-by-step visualization of your pattern.'
    },
    {
      icon: '🎯',
      title: 'Fully Customizable',
      description: 'Control every aspect: adjust pins (50-500), lines (up to 5000), line weight, edge detection, and more for perfect results.'
    },
    {
      icon: '💾',
      title: 'Multiple Export Options',
      description: 'Download high-quality PNG images for printing or export JSON coordinates for physical recreation on wood boards with nails and thread.'
    },
    {
      icon: '📱',
      title: 'Works on All Devices',
      description: 'Fully responsive design works perfectly on desktop, tablet, and mobile. Create string art anywhere, anytime from any device.'
    },
    {
      icon: '🔒',
      title: 'Privacy Focused',
      description: 'All processing happens in your browser. Your images never leave your device - complete privacy and security guaranteed.'
    },
    {
      icon: '🎁',
      title: 'Perfect for DIY Projects',
      description: 'Create unique wall art, personalized gifts, wedding decorations, portraits, logos, and more. Commercial use allowed.'
    }
  ]

  return (
    <section className="benefits" id="features">
      <div className="benefits-container">
        <h2>Why Choose Our String Art Generator?</h2>
        <p className="benefits-subtitle">
          The most powerful and user-friendly free online string art generator.
          Everything you need to create beautiful thread art patterns from your photos.
        </p>

        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="benefits-footer">
          <h3>Join Thousands of Happy Users</h3>
          <p>Artists, DIY enthusiasts, and creators worldwide trust our string art generator for their projects.</p>
        </div>
      </div>
    </section>
  )
}

export default Benefits
