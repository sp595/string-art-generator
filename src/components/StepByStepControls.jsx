import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import AppIcon from './AppIcon'
import './StepByStepControls.css'

// Find the preview step whose lineCount is closest to targetLine
function lineToStep(steps, targetLine) {
  if (!steps?.length) return 0
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].lineCount >= targetLine) return i
  }
  return steps.length - 1
}

function StepByStepControls({
  // Preview mode
  currentStep,
  totalSteps,
  totalLines,
  steps,
  onStepChange,
  isPlaying,
  onPlayPause,
  stepData,
  // Manual mode
  mode,
  onModeChange,
  manualLine,
  onManualLineChange,
  manualInstruction,
  playSpeed,
  onPlaySpeedChange,
  // Save/load
  onSaveProgress,
  onLoadProgress,
  saving,
  saves,
  onDeleteSave,
  user,
  isConfigured
}) {
  const [jumpValue, setJumpValue] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [saveName, setSaveName] = useState('')
  const jumpInputRef = useRef(null)

  const isManual = mode === 'manual'
  const currentLine = isManual ? manualLine : (stepData?.lineCount ?? 0)
  const maxManualLine = totalLines - 1

  const handlePrev = () => {
    if (isManual) {
      if (manualLine > 0) onManualLineChange(manualLine - 1)
    } else {
      if (currentStep > 0) onStepChange(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (isManual) {
      if (manualLine < maxManualLine) onManualLineChange(manualLine + 1)
    } else {
      if (currentStep < totalSteps - 1) onStepChange(currentStep + 1)
    }
  }

  const handleFirst = () => {
    if (isManual) onManualLineChange(0)
    else onStepChange(0)
  }

  const handleLast = () => {
    if (isManual) onManualLineChange(maxManualLine)
    else onStepChange(totalSteps - 1)
  }

  const handleSlider = (e) => {
    const val = parseInt(e.target.value)
    if (isManual) {
      onManualLineChange(val)
    } else {
      // slider value = line index → convert to nearest preview step
      onStepChange(lineToStep(steps, val + 1))
    }
  }

  const handleJump = (e) => {
    e.preventDefault()
    const val = parseInt(jumpValue)
    if (isNaN(val)) return
    if (isManual) {
      const clamped = Math.max(0, Math.min(maxManualLine, val - 1))
      onManualLineChange(clamped)
    } else {
      // val is a line number → find nearest step
      const clamped = Math.max(1, Math.min(totalLines, val))
      onStepChange(lineToStep(steps, clamped))
    }
    setJumpValue('')
  }

  const handleSaveSubmit = (e) => {
    e.preventDefault()
    onSaveProgress(saveName)
    setSaveName('')
    setShowSaveModal(false)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      // Don't intercept if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === ' ') {
        e.preventDefault()
        onPlayPause()
      } else if (e.key === 'Home') {
        e.preventDefault()
        handleFirst()
      } else if (e.key === 'End') {
        e.preventDefault()
        handleLast()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [manualLine, currentStep, isManual, isPlaying])

  // Both modes use line numbers (0..totalLines-1) for slider and display
  const sliderMax = totalLines - 1
  const sliderVal = isManual ? manualLine : (stepData?.lineCount ?? 1) - 1
  const progress = sliderMax > 0 ? (sliderVal / sliderMax) * 100 : 0

  return (
    <>
    <div className="step-controls">
      {/* Mode tabs */}
      <div className="mode-tabs">
        <button
          className={`mode-tab ${!isManual ? 'active' : ''}`}
          onClick={() => onModeChange('preview')}
        >
          <AppIcon name="play" size={13} /> Anteprima
        </button>
        <button
          className={`mode-tab ${isManual ? 'active' : ''}`}
          onClick={() => onModeChange('manual')}
        >
          <AppIcon name="hand" size={13} /> Manuale
        </button>
      </div>

      {/* Manual mode: big pin instruction */}
      {isManual && manualInstruction && (
        <div className="manual-instruction">
          <div className="manual-step-label">PASSAGGIO {manualLine + 1} / {totalLines}</div>
          <div className="manual-pins">
            <div className="manual-pin from">
              <span className="manual-pin-tag">DA</span>
              <span className="manual-pin-num">{manualInstruction.fromPin}</span>
            </div>
            <div className="manual-arrow">
              <AppIcon name="moveRight" size={28} />
            </div>
            <div className="manual-pin to">
              <span className="manual-pin-tag">A</span>
              <span className="manual-pin-num">{manualInstruction.toPin}</span>
            </div>
          </div>
          <div className="manual-hint">
            Avvolgi il filo dal pin <strong>{manualInstruction.fromPin}</strong> al pin <strong>{manualInstruction.toPin}</strong>
          </div>
        </div>
      )}

      {/* Preview mode: compact info */}
      {!isManual && stepData && (
        <div className="step-info">
          <div className="step-header">
            <span className="step-label">Anteprima</span>
            <span className="step-counter">{stepData.lineCount} / {totalLines}</span>
          </div>

          <div className="pin-info">
            <span className="pin-label">Pin {stepData.fromPin}</span>
            <span className="pin-arrow"><AppIcon name="moveRight" size={16} /></span>
            <span className="pin-label">Pin {stepData.toPin}</span>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="step-buttons">
        <button className="step-btn" onClick={handleFirst} disabled={sliderVal === 0} title="Inizio (Home)">
          <AppIcon name="chevronsLeft" size={18} />
        </button>
        <button className="step-btn" onClick={handlePrev} disabled={sliderVal === 0} title="Indietro (←)">
          <AppIcon name="chevronLeft" size={18} />
        </button>
        <button className="step-btn step-btn-play" onClick={onPlayPause} title="Play/Pausa (Spazio)">
          {isPlaying ? <AppIcon name="pause" size={18} /> : <AppIcon name="play" size={18} />}
        </button>
        <button className="step-btn" onClick={handleNext} disabled={sliderVal === sliderMax} title="Avanti (→)">
          <AppIcon name="chevronRight" size={18} />
        </button>
        <button className="step-btn" onClick={handleLast} disabled={sliderVal === sliderMax} title="Fine (End)">
          <AppIcon name="chevronsRight" size={18} />
        </button>
      </div>

      {/* Progress slider */}
      <div className="step-slider-container">
        <input
          type="range"
          className="step-slider"
          min="0"
          max={sliderMax}
          value={sliderVal}
          onChange={handleSlider}
        />
        <div className="step-slider-track" style={{ width: `${progress}%` }} />
      </div>

      {/* Jump + speed controls */}
      <div className="step-secondary-controls">
        <form className="jump-form" onSubmit={handleJump}>
          <input
            ref={jumpInputRef}
            className="jump-input"
            type="number"
            placeholder={`Vai a linea (1–${totalLines})`}
            value={jumpValue}
            onChange={e => setJumpValue(e.target.value)}
            min="1"
            max={isManual ? totalLines : totalSteps}
          />
          <button type="submit" className="jump-btn">Vai</button>
        </form>

        <label className="speed-control">
          <span className="speed-label">Velocità</span>
          <input
            type="range"
            className="speed-slider"
            min="30"
            max="800"
            step="10"
            value={playSpeed}
            onChange={e => onPlaySpeedChange(parseInt(e.target.value))}
          />
          <span className="speed-value">{playSpeed > 400 ? 'Lenta' : playSpeed > 150 ? 'Media' : 'Veloce'}</span>
        </label>
      </div>

      {/* Save/Load progress */}
      <div className="save-controls">
        <button
          className="save-btn"
          onClick={() => setShowSaveModal(true)}
          disabled={saving}
          title={!user && isConfigured ? 'Accedi per sincronizzare su cloud' : ''}
        >
          <AppIcon name="save" size={14} />
          {saving ? 'Salvataggio...' : 'Salva progresso'}
          {!user && isConfigured && <span className="save-badge">locale</span>}
        </button>

        {saves.length > 0 && (
          <button className="load-btn" onClick={() => { setShowLoadModal(true) }}>
            <AppIcon name="folderOpen" size={14} />
            Carica ({saves.length})
          </button>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="keyboard-hint">
        ← → naviga &nbsp;·&nbsp; Spazio play/pausa &nbsp;·&nbsp; Home/End inizio/fine
      </div>

    </div>

    {/* Save modal — portaled to body to escape overflow:hidden parents */}
    {showSaveModal && createPortal(
      <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <h4>Salva progresso</h4>
          <p className="modal-sub">
            Linea corrente: <strong>{sliderVal + 1}</strong> / {totalLines}
            {!user && isConfigured && <span className="modal-note"> · Salvataggio locale (accedi per sincronizzare)</span>}
            {!isConfigured && <span className="modal-note"> · Salvataggio locale</span>}
          </p>
          <form onSubmit={handleSaveSubmit}>
            <input
              className="modal-input"
              type="text"
              placeholder={`Sessione ${new Date().toLocaleDateString('it-IT')}`}
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              autoFocus
            />
            <div className="modal-buttons">
              <button type="button" className="modal-cancel" onClick={() => setShowSaveModal(false)}>Annulla</button>
              <button type="submit" className="modal-confirm">Salva</button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    )}

    {/* Load modal — portaled to body */}
    {showLoadModal && createPortal(
      <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
        <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
          <h4>Carica sessione salvata</h4>
          <div className="saves-list">
            {saves.map(save => (
              <div key={save.id} className="save-item">
                <div className="save-item-info">
                  <span className="save-item-name">{save.name}</span>
                  <span className="save-item-meta">
                    Linea {save.currentLine + 1} / {save.lineSequence?.length ?? '?'} &nbsp;·&nbsp;
                    {new Date(save.savedAt).toLocaleString('it-IT')}
                  </span>
                </div>
                <div className="save-item-actions">
                  <button
                    className="save-item-load"
                    onClick={() => { onLoadProgress(save); setShowLoadModal(false) }}
                  >
                    Carica
                  </button>
                  <button
                    className="save-item-delete"
                    onClick={() => onDeleteSave(save.id)}
                  >
                    <AppIcon name="trash2" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="modal-cancel full-width" onClick={() => setShowLoadModal(false)}>Chiudi</button>
        </div>
      </div>,
      document.body
    )}
    </>
  )
}

export default StepByStepControls
