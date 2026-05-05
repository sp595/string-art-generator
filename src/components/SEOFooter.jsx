import React from 'react'
import { en } from '../i18n/en'
import './SEOFooter.css'

function SEOFooter() {
  const { footer } = en

  return (
    <footer className="seo-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>{footer.aboutTitle}</h3>
          <p>{footer.aboutText}</p>
        </div>

        <div className="footer-section">
          <h3>{footer.linksTitle}</h3>
          <nav aria-label="Footer navigation">
            <ul>
              <li><a href="#features">{footer.links.features}</a></li>
              <li><a href="#how-it-works">{footer.links.howItWorks}</a></li>
              <li><a href="#faq">{footer.links.faq}</a></li>
              <li><a href="/">{footer.links.generator}</a></li>
            </ul>
          </nav>
        </div>

        <div className="footer-section">
          <h3>{footer.useCasesTitle}</h3>
          <ul className="use-cases">
            {footer.useCases.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="footer-section">
          <h3>{footer.keywordsTitle}</h3>
          <p className="footer-keywords">{footer.keywords}</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} {footer.copyrightPrefix}{" "}
          <a
            href="https://cmdc.it"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            cmdc
          </a>
        </p>
        <p className="footer-tech">{footer.tech}</p>
      </div>
    </footer>
  )
}

export default SEOFooter
