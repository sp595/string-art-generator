import React, { useEffect, useRef, useState, useCallback } from 'react'
import AppIcon from './AppIcon'
import StepByStepControls from './StepByStepControls'
import { en } from '../i18n/en'
import { exportPinStencilToPdf, getA4TilingConfig } from '../utils/tiledPdfExport'
import { buildManualInstructions } from '../utils/stringArtCore'
import './StringArtCanvas.css'

function calculateThreadLengthM(lineSequence, pinCoords, startPin, canvasRadiusCm, imageSize) {
  if (!lineSequence?.length || !pinCoords?.length) return 0
  let totalPx = 0
  let cur = startPin ?? 0
  for (const next of lineSequence) {
    const p1 = pinCoords[cur]
    const p2 = pinCoords[next]
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    totalPx += Math.sqrt(dx * dx + dy * dy)
    cur = next
  }
  // imageSize/2 pixels = canvasRadiusCm cm
  const cmPerPx = canvasRadiusCm / (imageSize / 2)
  return (totalPx * cmPerPx) / 100  // metres
}

function StringArtCanvas({
  image,
  result,
  liveResult,
  parameters,
  isProcessing,
  progress = 0,
  onNotify,
  onEditCrop,
  // save/load props
  user,
  saves,
  saving,
  onSaveProgress,
  onLoadProgress,
  onDeleteSave,
  isConfigured
}) {
  const canvasRef = useRef(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(120)
  const [mode, setMode] = useState('preview')
  const [manualLine, setManualLine] = useState(0)
  const playIntervalRef = useRef(null)
  const [physicalSizeCm, setPhysicalSizeCm] = useState(50)
  const [pageOrientation, setPageOrientation] = useState('portrait')
  const [pageMarginMm, setPageMarginMm] = useState(5)

  const getStatusMessage = (p) => {
    if (p < 10) return en.loading.states.loadingImage
    if (p < 20) return en.loading.states.detectingEdges
    if (p < 30) return en.loading.states.calculatingPins
    if (p < 40) return en.loading.states.precalculatingLines
    if (p < 100) return en.loading.states.generating
    return en.loading.states.complete
  }

  // Reset when result changes
  useEffect(() => {
    if (result?.steps) {
      setCurrentStep(result.steps.length - 1)
      setManualLine(0)
      setMode('preview')
    }
  }, [result])

  // Auto-play
  useEffect(() => {
    if (isPlaying && result) {
      playIntervalRef.current = setInterval(() => {
        if (mode === 'manual') {
          setManualLine(prev => {
            const next = prev + 1
            if (next >= result.lineSequence.length) {
              setIsPlaying(false)
              return result.lineSequence.length - 1
            }
            return next
          })
        } else {
          setCurrentStep(prev => {
            const next = prev + 1
            if (!result.steps || next >= result.steps.length) {
              setIsPlaying(false)
              return result.steps ? result.steps.length - 1 : 0
            }
            return next
          })
        }
      }, playSpeed)
    } else {
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = null
    }

    return () => clearInterval(playIntervalRef.current)
  }, [isPlaying, result, mode, playSpeed])

  // Canvas rendering
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { imageSize } = parameters

    canvas.width = imageSize
    canvas.height = imageSize

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, imageSize, imageSize)

    if (showOriginal && image) {
      ctx.drawImage(image, 0, 0, imageSize, imageSize)
    } else if (result && !isProcessing) {
      const stepData = mode === 'preview'
        ? (result.steps && result.steps[currentStep])
        : null
      drawStringArt(ctx, result, imageSize, stepData, mode, manualLine)
    } else if (isProcessing && liveResult?.lineSequence?.length > 0) {
      drawStringArt(ctx, liveResult, imageSize, null, 'preview', 0)
    } else if (image && !result) {
      ctx.globalAlpha = 0.3
      ctx.drawImage(image, 0, 0, imageSize, imageSize)
      ctx.globalAlpha = 1
      drawPinPreview(ctx, parameters)
    }
  }, [image, result, liveResult, parameters, isProcessing, showOriginal, currentStep, mode, manualLine])

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

  const drawStringArt = (ctx, result, imageSize, stepData, renderMode, currentManualLine) => {
    const { lineSequence, pinCoords, startPin = 0 } = result

    const sequenceToDraw = renderMode === 'manual'
      ? lineSequence.slice(0, currentManualLine + 1)
      : (stepData ? stepData.lineSequence : lineSequence)

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, imageSize, imageSize)

    const rendering = result.rendering || {}
    const lineOpacity = rendering.lineOpacity || 0.15
    const lineWidth = rendering.lineWidth || 0.8
    const pinRadius = rendering.pinRadius || 1.5

    ctx.strokeStyle = `rgba(0, 0, 0, ${lineOpacity})`
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'

    let current = startPin
    for (const next of sequenceToDraw) {
      const p1 = pinCoords[current]
      const p2 = pinCoords[next]
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
      current = next
    }

    // Highlight current pin in manual mode
    if (renderMode === 'manual' && result.manualInstructions) {
      const instr = result.manualInstructions[currentManualLine]
      if (instr) {
        const nextInstr = result.manualInstructions[currentManualLine + 1]
        // Highlight destination pin (= fromPin of next step)
        const highlightPin = pinCoords[instr.toPin]
        ctx.fillStyle = '#667eea'
        ctx.beginPath()
        ctx.arc(highlightPin.x, highlightPin.y, pinRadius * 2.5, 0, 2 * Math.PI)
        ctx.fill()

        // Show next target pin
        if (nextInstr) {
          const nextPin = pinCoords[nextInstr.toPin]
          ctx.fillStyle = 'rgba(118,75,162,0.5)'
          ctx.beginPath()
          ctx.arc(nextPin.x, nextPin.y, pinRadius * 2, 0, 2 * Math.PI)
          ctx.fill()
        }
      }
    }

    // Draw all pins
    ctx.fillStyle = '#333'
    for (const pin of pinCoords) {
      ctx.beginPath()
      ctx.arc(pin.x, pin.y, pinRadius, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  const getTilingConfig = () => getA4TilingConfig(physicalSizeCm, pageOrientation, pageMarginMm)

  const handleDownloadImage = () => {
    if (!canvasRef.current || !result) return

    const link = document.createElement('a')
    link.download = `string-art-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()

    onNotify?.(en.toast.imageDownloaded, 'success')
  }

  const handleExportTiledPdf = async () => {
    if (!result) return

    try {
      const tiling = await exportPinStencilToPdf({
        pinCoords: result.pinCoords,
        imageSize: result.parameters.imageSize,
        physicalSizeCm,
        orientation: pageOrientation,
        marginMm: pageMarginMm,
        fileName: `string-art-pin-stencil-${Number(physicalSizeCm) || 0}cm-${Date.now()}.pdf`
      })

      onNotify?.(en.toast.tiledExported.replace('{pages}', tiling.totalPages), 'success')
    } catch (error) {
      onNotify?.(en.toast.pdfExportFailed, 'error')
    }
  }

  const handleLoadProgress = useCallback((save) => {
    // Reconstruct manualInstructions if missing (old saves)
    const manualInstructions = save.manualInstructions
      ?? buildManualInstructions(save.lineSequence, save.startPin ?? 0)

    const restored = {
      lineSequence: save.lineSequence,
      pinCoords: save.pinCoords,
      startPin: save.startPin ?? 0,
      parameters: save.parameters,
      rendering: save.rendering,
      manualInstructions,
      steps: [],
      stats: {
        totalLines: save.lineSequence.length,
        previewSteps: 0,
        generatedAt: save.savedAt
      }
    }

    // Signal parent to set result
    if (onNotify) onNotify('Sessione caricata!', 'success')

    // We need to propagate up — handled via prop
    if (onLoadProgress) onLoadProgress(restored, save.currentLine)
  }, [onNotify])

  const handleSaveProgress = useCallback((name) => {
    if (!result || !onSaveProgress) return
    const line = mode === 'manual' ? manualLine : 0
    onSaveProgress(result, line, name)
  }, [result, mode, manualLine, onSaveProgress])

  const tiling = getTilingConfig()
  const manualInstruction = result?.manualInstructions?.[manualLine]

  return (
    <div className="string-art-canvas">
      <div className="canvas-header">
        <h3>{en.canvas.title}</h3>
        <div className="canvas-controls">
          {image && onEditCrop && !result && (
            <button className="edit-crop-btn" onClick={onEditCrop} disabled={isProcessing}>
              <AppIcon name="scissors" size={16} /> {en.canvas.editCrop}
            </button>
          )}
          {result && (
            <>
              {image && (
                <button className="toggle-btn" onClick={() => setShowOriginal(!showOriginal)}>
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
        {(image || result) && <canvas ref={canvasRef} className="canvas" />}

        {isProcessing && liveResult?.lineSequence?.length > 0 && (
          <div className="processing-overlay-compact">
            <div className="compact-progress-bar">
              <div className="compact-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="compact-progress-info">
              <span className="compact-status">{getStatusMessage(progress)}</span>
              <span className="compact-pct">{progress}%</span>
            </div>
          </div>
        )}

        {isProcessing && !liveResult?.lineSequence?.length && (
          <div className="processing-overlay">
            <div className="loading-content">
              <div className="spinner-container">
                <div className="spinner"></div>
                <div className="spinner-glow"></div>
              </div>
              <h3 className="loading-title">{en.loading.title}</h3>
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}>
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
          <div className="empty-state"><p>{en.canvas.empty}</p></div>
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
                <input type="number" min="10" max="300" step="1"
                  value={physicalSizeCm}
                  onChange={e => setPhysicalSizeCm(e.target.value)} />
              </label>
              <label className="tile-field">
                <span>{en.canvas.tiling.orientation}</span>
                <select value={pageOrientation} onChange={e => setPageOrientation(e.target.value)}>
                  <option value="portrait">A4 Portrait</option>
                  <option value="landscape">A4 Landscape</option>
                </select>
              </label>
              <label className="tile-field">
                <span>{en.canvas.tiling.margin}</span>
                <input type="number" min="0" max="20" step="1"
                  value={pageMarginMm}
                  onChange={e => setPageMarginMm(e.target.value)} />
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
            <div className="stat-item stat-item-wide">
              <span className="stat-label">Lunghezza filo stimata</span>
              <span className="stat-value stat-thread">
                {calculateThreadLengthM(
                  result.lineSequence,
                  result.pinCoords,
                  result.startPin,
                  parameters.canvasRadiusCm ?? 30,
                  result.parameters.imageSize
                ).toFixed(1)} m
                <span className="stat-thread-sub">
                  con raggio {parameters.canvasRadiusCm ?? 30} cm
                </span>
              </span>
            </div>
          </div>

          <StepByStepControls
            currentStep={currentStep}
            totalSteps={result.steps?.length ?? 0}
            totalLines={result.stats.totalLines}
            onStepChange={setCurrentStep}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            stepData={result.steps?.[currentStep]}
            mode={mode}
            onModeChange={setMode}
            manualLine={manualLine}
            onManualLineChange={setManualLine}
            manualInstruction={manualInstruction}
            playSpeed={playSpeed}
            onPlaySpeedChange={setPlaySpeed}
            onSaveProgress={handleSaveProgress}
            onLoadProgress={handleLoadProgress}
            saving={saving}
            saves={saves || []}
            onDeleteSave={onDeleteSave}
            user={user}
            isConfigured={isConfigured}
          />
        </>
      )}
    </div>
  )
}

export default StringArtCanvas
