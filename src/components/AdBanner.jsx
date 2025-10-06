import React, { useEffect } from 'react'
import './AdBanner.css'

/**
 * Google AdSense Banner Component
 *
 * Usage:
 * <AdBanner slot="YOUR_AD_SLOT_ID" format="horizontal" />
 *
 * Formats: 'horizontal', 'vertical', 'square'
 */
function AdBanner({ slot, format = 'horizontal', className = '' }) {
  useEffect(() => {
    try {
      // Push ad if AdSense is loaded
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  // Get ad dimensions based on format
  const getAdStyle = () => {
    switch (format) {
      case 'horizontal':
        return { display: 'block', height: '90px' }
      case 'vertical':
        return { display: 'block', width: '160px', height: '600px' }
      case 'square':
        return { display: 'block', width: '300px', height: '250px' }
      default:
        return { display: 'block' }
    }
  }

  return (
    <div className={`ad-banner ad-banner-${format} ${className}`}>
      <ins
        className="adsbygoogle"
        style={getAdStyle()}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  )
}

export default AdBanner
