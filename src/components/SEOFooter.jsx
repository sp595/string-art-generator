import React from 'react'
import './SEOFooter.css'

function SEOFooter() {
  return (
    <footer className="seo-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>About String Art Generator</h3>
          <p>
            Free online string art generator tool that transforms any image into beautiful thread art patterns.
            Create professional DIY nail and thread art for wall decor, personalized gifts, and creative projects.
            100% free with no registration required.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <nav aria-label="Footer navigation">
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="/">Generator Tool</a></li>
            </ul>
          </nav>
        </div>

        <div className="footer-section">
          <h3>Use Cases</h3>
          <ul className="use-cases">
            <li>Portrait String Art</li>
            <li>Geometric Patterns</li>
            <li>Logo String Art</li>
            <li>Wedding Decorations</li>
            <li>Wall Art & Home Decor</li>
            <li>Personalized Gifts</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Keywords</h3>
          <p className="footer-keywords">
            String art generator, thread art maker, nail art pattern, DIY string art, geometric art generator,
            wall art creator, line art generator, circular string art, mandala generator, portrait string art,
            free online tool, no registration
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} String Art Generator — Powered by{" "}
          <a
            href="https://cmdc.it"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            cmdc
          </a>
        </p>
        <p className="footer-tech">
          Built with • Advanced Edge Detection • Greedy Optimization Algorithm
        </p>
      </div>
    </footer>
  )
}

export default SEOFooter
