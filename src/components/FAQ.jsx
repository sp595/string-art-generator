import React, { useState } from 'react'
import { en } from '../i18n/en'
import './FAQ.css'

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)
  const { faq } = en
  const faqs = faq.items

  return (
    <section className="faq-section" id="faq">
      <span className="faq-kicker">{faq.kicker}</span>
      <h2>{faq.title}</h2>
      <p className="faq-subtitle">{faq.subtitle}</p>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? 'open' : ''}`}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setOpenIndex(openIndex === index ? null : index)
              }
            }}
          >
            <div className="faq-question">
              <h3>{faq.question}</h3>
              <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
            </div>
            {openIndex === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default FAQ
