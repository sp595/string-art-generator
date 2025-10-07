import React, { useState } from 'react'
import './FAQ.css'

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'What is string art?',
      answer: 'String art is a decorative technique where thread or string is wound around pins to create geometric patterns or images. Our tool helps you generate the pattern coordinates from any image.'
    },
    {
      question: 'How does the string art generator work?',
      answer: 'Upload your image, adjust parameters like number of pins and lines, then click generate. Our advanced algorithm calculates the optimal line sequence to recreate your image using string art techniques.'
    },
    {
      question: 'Is this tool completely free?',
      answer: 'Yes! The String Art Generator is completely free to use. No sign-up required, no hidden fees. Just upload, generate, and download your results.'
    },
    {
      question: 'What image formats are supported?',
      answer: 'We support all common image formats including JPG, PNG, and GIF. For best results, use high-contrast images with clear subjects.'
    },
    {
      question: 'Can I use this for commercial projects?',
      answer: 'Yes, you can use the generated patterns for personal or commercial projects. The output coordinates and images are yours to use freely.'
    },
    {
      question: 'What can I do with the exported JSON file?',
      answer: 'The JSON file contains the pin coordinates and line sequence. You can use this data to physically create the string art, or import it into other applications for further processing.'
    },
    {
      question: 'How long does generation take?',
      answer: 'Generation time varies based on your parameters. Basic algorithm: 2-5 seconds. Advanced algorithm: 15-30 seconds. The tool shows real-time progress.'
    },
    {
      question: 'What is the advanced algorithm?',
      answer: 'The advanced algorithm includes edge detection, adaptive line weights, and look-ahead optimization for higher quality results. It takes longer but produces more accurate patterns.'
    }
  ]

  return (
    <section className="faq-section" id="faq">
      <h2>Frequently Asked Questions About String Art Generator</h2>
      <p className="faq-subtitle">Everything you need to know about creating beautiful thread art online</p>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? 'open' : ''}`}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
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
