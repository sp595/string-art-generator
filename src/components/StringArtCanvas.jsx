import React, { useEffect, useRef, useState } from 'react'
import { en } from '../i18n/en'
import './StringArtCanvas.css'

function StringArtCanvas({ image, result, parameters, isProcessing, progress = 0, onNotify, onEditCrop }) {
  const canvasRef = useRef(null)
  const [showOriginal, setShowOriginal] = useState(false)

  const getStatusMessage = (progress) => {
    if (progress < 10) return en.loading.states.loadingImage
    if (progress < 20) return en.loading.states.detectingEdges
    if (progress < 30) return en.loading.states.calculatingPins
    if (progress < 40) return en.loading.states.precalculatingLines
    if (progress < 100) return en.loading.states.generating
    return en.loading.states.complete
  }

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { imageSize } = parameters

    // Set canvas size
    canvas.width = imageSize
    canvas.height = imageSize

    // Clear canvas
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, imageSize, imageSize)

    if (showOriginal && image) {
      // Show original image
      ctx.drawImage(image, 0, 0, imageSize, imageSize)
    } else if (result && !isProcessing) {
      // Draw string art
      drawStringArt(ctx, result, imageSize)
    } else if (image && !result) {
      // Show preview of original image
      ctx.globalAlpha = 0.3
      ctx.drawImage(image, 0, 0, imageSize, imageSize)
      ctx.globalAlpha = 1

      // Draw pin positions preview
      drawPinPreview(ctx, parameters)
    }
  }, [image, result, parameters, isProcessing, showOriginal])

  const drawPinPreview = (ctx, params) => {
    const { pins, imageSize } = params
    const center = imageSize / 2
    const radius = imageSize / 2 - 1

    ctx.strokeStyle = '#667eea'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, 2 * Math.PI)
    ctx.stroke()

    ctx.fillStyle = '#764ba2'
    for (let i = 0; i < pins; i++) {
      const angle = (2 * Math.PI * i) / pins
      const x = center + radius * Math.cos(angle)
      const y = center + radius * Math.sin(angle)
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  const drawStringArt = (ctx, result, imageSize) => {
    const { lineSequence, pinCoords } = result

    // Draw white background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, imageSize, imageSize)

    // Draw lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.lineWidth = 0.8
    ctx.lineCap = 'round'

    let currentPin = 0
    for (const nextPin of lineSequence) {
      const p1 = pinCoords[currentPin]
      const p2 = pinCoords[nextPin]

      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()

      currentPin = nextPin
    }

    // Draw pins on top
    ctx.fillStyle = '#333'
    for (const pin of pinCoords) {
      ctx.beginPath()
      ctx.arc(pin.x, pin.y, 1.5, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  const handleDownloadImage = () => {
    if (!canvasRef.current || !result) return

    const link = document.createElement('a')
    link.download = `string-art-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()

    if (onNotify) {
      onNotify(en.toast.imageDownloaded, 'success')
    }
  }

  return (
    <div className="string-art-canvas">
      <div className="canvas-header">
        <h3>{en.canvas.title}</h3>
        <div className="canvas-controls">
          {image && onEditCrop && (
            <button
              className="edit-crop-btn"
              onClick={onEditCrop}
              disabled={isProcessing}
            >
              ✂️ {en.canvas.editCrop}
            </button>
          )}
          {result && (
            <>
              <button
                className="toggle-btn"
                onClick={() => setShowOriginal(!showOriginal)}
              >
                {showOriginal ? en.canvas.showStringArt : en.canvas.showOriginal}
              </button>
              <button className="download-btn" onClick={handleDownloadImage}>
                {en.canvas.download}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="canvas-container">
        {image && (
          <canvas ref={canvasRef} className="canvas" />
        )}

        {isProcessing && (
          <div className="processing-overlay">
            <div className="loading-content">
              <div className="spinner-container">
                <div className="spinner"></div>
                <div className="spinner-glow"></div>
              </div>

              <h3 className="loading-title">{en.loading.title}</h3>

              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  >
                    <span className="progress-text">{progress}%</span>
                  </div>
                </div>
              </div>

              <p className="status-message">{getStatusMessage(progress)}</p>

              {progress >= 30 && (
                <div className="processing-stats">
                  <div className="stat-badge">
                    <span className="stat-icon">📍</span>
                    <span>{parameters.pins} pin</span>
                  </div>
                  <div className="stat-badge">
                    <span className="stat-icon">📏</span>
                    <span>{parameters.maxLines} linee</span>
                  </div>
                  <div className="stat-badge">
                    <span className="stat-icon">⚡</span>
                    <span>{parameters.useAdvancedAlgorithm ? 'Advanced' : 'Basic'}</span>
                  </div>
                </div>
              )}

              <p className="loading-tip">
                💡 Tip: {parameters.useWebWorker
                  ? en.loading.tips.webWorker
                  : en.loading.tips.blocking}
              </p>
            </div>
          </div>
        )}

        {!image && !isProcessing && (
          <div className="empty-state">
            <p>{en.canvas.empty}</p>
          </div>
        )}
      </div>

      {result && (
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">{en.canvas.stats.linesGenerated}</span>
            <span className="stat-value">{result.stats.totalLines}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{en.canvas.stats.pinsUsed}</span>
            <span className="stat-value">{result.parameters.pins}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{en.canvas.stats.lineWeight}</span>
            <span className="stat-value">{result.parameters.lineWeight}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default StringArtCanvas
