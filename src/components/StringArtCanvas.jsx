import React, { useEffect, useRef, useState } from 'react'
import AppIcon from './AppIcon'
import StepByStepControls from './StepByStepControls'
import { en } from '../i18n/en'
import { exportTiledCanvasToPdf, getA4TilingConfig } from '../utils/tiledPdfExport'
import './StringArtCanvas.css'

function StringArtCanvas({ image, result, parameters, isProcessing, progress = 0, onNotify, onEditCrop }) {
  const canvasRef = useRef(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef(null)
  const [physicalSizeCm, setPhysicalSizeCm] = useState(50)
  const [pageOrientation, setPageOrientation] = useState('portrait')
  const [pageMarginMm, setPageMarginMm] = useState(5)

  const getStatusMessage = (progress) => {
    if (progress < 10) return en.loading.states.loadingImage
    if (progress < 20) return en.loading.states.detectingEdges
    if (progress < 30) return en.loading.states.calculatingPins
    if (progress < 40) return en.loading.states.precalculatingLines
    if (progress < 100) return en.loading.states.generating
    return en.loading.states.complete
  }

  // Reset step when result changes
  useEffect(() => {
    if (result && result.steps) {
      setCurrentStep(result.steps.length - 1) // Start at final step
    }
  }, [result])

  // Handle auto-play
  useEffect(() => {
    if (isPlaying && result && result.steps) {
      playIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          const next = prev + 1
          if (next >= result.steps.length) {
            setIsPlaying(false)
            return result.steps.length - 1
          }
          return next
        })
      }, 100) // 100ms between steps
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = null
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [isPlaying, result])

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
      // Draw string art (with step if available)
      const stepData = result.steps && result.steps[currentStep]
      drawStringArt(ctx, result, imageSize, stepData)
    } else if (image && !result) {
      // Show preview of original image
      ctx.globalAlpha = 0.3
      ctx.drawImage(image, 0, 0, imageSize, imageSize)
      ctx.globalAlpha = 1

      // Draw pin positions preview
      drawPinPreview(ctx, parameters)
    }
  }, [image, result, parameters, isProcessing, showOriginal, currentStep])

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

  const drawStringArt = (ctx, result, imageSize, stepData = null) => {
    const { lineSequence, pinCoords } = result

    // Use step data if available, otherwise use full sequence
    const sequenceToDraw = stepData ? stepData.lineSequence : lineSequence

    // Draw white background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, imageSize, imageSize)

    // Draw lines
    const rendering = result.rendering || {}
    const lineOpacity = rendering.lineOpacity || 0.15
    const lineWidth = rendering.lineWidth || 0.8
    const pinRadius = rendering.pinRadius || 1.5

    ctx.strokeStyle = `rgba(0, 0, 0, ${lineOpacity})`
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'

    let currentPin = 0
    for (const nextPin of sequenceToDraw) {
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
      ctx.arc(pin.x, pin.y, pinRadius, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  const buildRenderCanvas = () => {
    if (!result) return null

    const renderCanvas = document.createElement('canvas')
    const { imageSize } = parameters
    renderCanvas.width = imageSize
    renderCanvas.height = imageSize

    const renderCtx = renderCanvas.getContext('2d')
    drawStringArt(renderCtx, result, imageSize)

    return renderCanvas
  }

  const getTilingConfig = () => {
    return getA4TilingConfig(physicalSizeCm, pageOrientation, pageMarginMm)
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

  const handleExportTiledPdf = async () => {
    if (!result) return

    const renderCanvas = buildRenderCanvas()
    if (!renderCanvas) return

    try {
      const tiling = await exportTiledCanvasToPdf(renderCanvas, {
        physicalSizeCm,
        orientation: pageOrientation,
        marginMm: pageMarginMm,
        fileName: `string-art-a4-${Number(physicalSizeCm) || 0}cm-${Date.now()}.pdf`
      })

      if (onNotify) {
        onNotify(
          en.toast.tiledExported.replace('{pages}', tiling.totalPages),
          'success'
        )
      }
    } catch (error) {
      console.error('Error exporting tiled PDF:', error)
      if (onNotify) {
        onNotify(en.toast.pdfExportFailed, 'error')
      }
    }
  }

  const tiling = getTilingConfig()

  return (
    <div className="string-art-canvas">
      <div className="canvas-header">
        <h3>{en.canvas.title}</h3>
        <div className="canvas-controls">
          {image && onEditCrop && !result && (
            <button
              className="edit-crop-btn"
              onClick={onEditCrop}
              disabled={isProcessing}
            >
              <AppIcon name="scissors" size={16} /> {en.canvas.editCrop}
            </button>
          )}
          {result && (
            <>
              {image && (
                <button
                  className="toggle-btn"
                  onClick={() => setShowOriginal(!showOriginal)}
                >
                  {showOriginal ? en.canvas.showStringArt : en.canvas.showOriginal}
                </button>
              )}
              <button className="download-btn" onClick={handleDownloadImage}>
                {en.canvas.download}
              </button>
              <button className="download-btn tiled-btn" onClick={handleExportTiledPdf}>
                {en.canvas.downloadTiled}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="canvas-container">
        {(image || result) && (
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
                    <span className="stat-icon"><AppIcon name="target" size={16} /></span>
                    <span>{parameters.pins} pin</span>
                  </div>
                  <div className="stat-badge">
                    <span className="stat-icon"><AppIcon name="fileText" size={16} /></span>
                    <span>{parameters.maxLines} linee</span>
                  </div>
                  <div className="stat-badge">
                    <span className="stat-icon"><AppIcon name="zap" size={16} /></span>
                    <span>{parameters.useAdvancedAlgorithm ? 'Advanced' : 'Basic'}</span>
                  </div>
                </div>
              )}

              <p className="loading-tip">
                <AppIcon name="lightbulb" size={16} /> {parameters.useWebWorker
                  ? en.loading.tips.webWorker
                  : en.loading.tips.blocking}
              </p>
            </div>
          </div>
        )}

        {!image && !result && !isProcessing && (
          <div className="empty-state">
            <p>{en.canvas.empty}</p>
          </div>
        )}
      </div>

      {result && (
        <>
          <div className="tile-export-panel">
            <div className="tile-export-header">
              <h4>{en.canvas.tiling.title}</h4>
              <p>{en.canvas.tiling.description}</p>
            </div>

            <div className="tile-export-controls">
              <label className="tile-field">
                <span>{en.canvas.tiling.physicalSize}</span>
                <input
                  type="number"
                  min="10"
                  max="300"
                  step="1"
                  value={physicalSizeCm}
                  onChange={(event) => setPhysicalSizeCm(event.target.value)}
                />
              </label>

              <label className="tile-field">
                <span>{en.canvas.tiling.orientation}</span>
                <select
                  value={pageOrientation}
                  onChange={(event) => setPageOrientation(event.target.value)}
                >
                  <option value="portrait">A4 Portrait</option>
                  <option value="landscape">A4 Landscape</option>
                </select>
              </label>

              <label className="tile-field">
                <span>{en.canvas.tiling.margin}</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="1"
                  value={pageMarginMm}
                  onChange={(event) => setPageMarginMm(event.target.value)}
                />
              </label>
            </div>

            <div className="tile-export-summary">
              <span>{en.canvas.tiling.pages.replace('{pages}', tiling.totalPages)}</span>
              <span>{en.canvas.tiling.grid.replace('{cols}', tiling.columns).replace('{rows}', tiling.rows)}</span>
              <span>{en.canvas.tiling.tileSize.replace('{width}', tiling.tileWidthMm.toFixed(1)).replace('{height}', tiling.tileHeightMm.toFixed(1))}</span>
            </div>
          </div>

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

          {/* Step-by-Step Controls */}
          {result.steps && result.steps.length > 1 && (
            <StepByStepControls
              currentStep={currentStep}
              totalSteps={result.steps.length}
              totalLines={result.stats.totalLines}
              onStepChange={setCurrentStep}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              stepData={result.steps[currentStep]}
            />
          )}
        </>
      )}
    </div>
  )
}

export default StringArtCanvas
