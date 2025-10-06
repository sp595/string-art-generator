import React, { useState, useRef, useEffect } from 'react'
import { en } from '../i18n/en'
import './ImageCropper.css'

function ImageCropper({ image, onCropComplete, targetSize }) {
  const canvasRef = useRef(null)
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    scale: 1
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)

  // Calculate initial scale to fit image
  useEffect(() => {
    if (!image) return

    const img = new Image()
    img.onload = () => {
      const imageAspect = img.width / img.height
      const targetAspect = 1 // Square

      let initialScale
      if (imageAspect > targetAspect) {
        // Image is wider - fit to height
        initialScale = targetSize / img.height
      } else {
        // Image is taller - fit to width
        initialScale = targetSize / img.width
      }

      // Center the image
      const scaledWidth = img.width * initialScale
      const scaledHeight = img.height * initialScale

      setCrop({
        x: (targetSize - scaledWidth) / 2,
        y: (targetSize - scaledHeight) / 2,
        scale: initialScale
      })

      setImageLoaded(true)
    }
    img.src = image.src
  }, [image, targetSize])

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !image || !imageLoaded) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Clear canvas
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, targetSize, targetSize)

    // Draw image
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      image.width * crop.scale,
      image.height * crop.scale
    )

    // Draw grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 1

    // Vertical lines
    for (let i = 1; i < 3; i++) {
      const x = (targetSize / 3) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, targetSize)
      ctx.stroke()
    }

    // Horizontal lines
    for (let i = 1; i < 3; i++) {
      const y = (targetSize / 3) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(targetSize, y)
      ctx.stroke()
    }

  }, [image, crop, targetSize, imageLoaded])

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - crop.x,
      y: e.clientY - crop.y
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    setCrop(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()

    const delta = e.deltaY > 0 ? 0.95 : 1.05
    const newScale = Math.max(0.1, Math.min(5, crop.scale * delta))

    // Zoom towards mouse position
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const scaleChange = newScale / crop.scale

    setCrop(prev => ({
      scale: newScale,
      x: mouseX - (mouseX - prev.x) * scaleChange,
      y: mouseY - (mouseY - prev.y) * scaleChange
    }))
  }

  const handleApplyCrop = () => {
    if (!canvasRef.current) return

    // Create final cropped image
    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = targetSize
    finalCanvas.height = targetSize
    const finalCtx = finalCanvas.getContext('2d')

    finalCtx.fillStyle = 'white'
    finalCtx.fillRect(0, 0, targetSize, targetSize)

    finalCtx.drawImage(
      image,
      crop.x,
      crop.y,
      image.width * crop.scale,
      image.height * crop.scale
    )

    // Convert to image
    const croppedImage = new Image()
    croppedImage.onload = () => {
      onCropComplete(croppedImage)
    }
    croppedImage.src = finalCanvas.toDataURL()
  }

  const handleReset = () => {
    // Reset to initial fit
    const img = image
    const imageAspect = img.width / img.height
    const targetAspect = 1

    let initialScale
    if (imageAspect > targetAspect) {
      initialScale = targetSize / img.height
    } else {
      initialScale = targetSize / img.width
    }

    const scaledWidth = img.width * initialScale
    const scaledHeight = img.height * initialScale

    setCrop({
      x: (targetSize - scaledWidth) / 2,
      y: (targetSize - scaledHeight) / 2,
      scale: initialScale
    })
  }

  return (
    <div className="image-cropper">
      <div className="cropper-header">
        <h3>{en.cropper.title}</h3>
        <p>{en.cropper.instructions}</p>
      </div>

      <div className="cropper-canvas-container">
        <canvas
          ref={canvasRef}
          width={targetSize}
          height={targetSize}
          className="cropper-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        />
      </div>

      <div className="cropper-controls">
        <div className="control-row">
          <label>{en.cropper.zoom}: {(crop.scale * 100).toFixed(0)}%</label>
          <input
            type="range"
            min="10"
            max="500"
            value={crop.scale * 100}
            onChange={(e) => setCrop(prev => ({ ...prev, scale: e.target.value / 100 }))}
            className="zoom-slider"
          />
        </div>

        <div className="cropper-buttons">
          <button className="btn-reset" onClick={handleReset}>
            {en.cropper.reset}
          </button>
          <button className="btn-apply" onClick={handleApplyCrop}>
            {en.cropper.apply}
          </button>
        </div>
      </div>

      <div className="cropper-info">
        <div className="info-item">
          <span className="info-label">{en.cropper.finalSize}</span>
          <span className="info-value">{targetSize}x{targetSize}px</span>
        </div>
        <div className="info-item">
          <span className="info-label">{en.cropper.originalSize}</span>
          <span className="info-value">{image.width}x{image.height}px</span>
        </div>
      </div>
    </div>
  )
}

export default ImageCropper
