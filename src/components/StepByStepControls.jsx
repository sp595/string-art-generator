import React from 'react'
import './StepByStepControls.css'

/**
 * Step-by-Step Controls Component
 * Allows navigation through string art generation steps
 */
function StepByStepControls({
  currentStep,
  totalSteps,
  onStepChange,
  isPlaying,
  onPlayPause,
  stepData // Current step data with fromPin and toPin
}) {
  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      onStepChange(currentStep + 1)
    }
  }

  const handleFirst = () => {
    onStepChange(0)
  }

  const handleLast = () => {
    onStepChange(totalSteps - 1)
  }

  const handleSliderChange = (e) => {
    onStepChange(parseInt(e.target.value))
  }

  return (
    <div className="step-controls">
      <div className="step-info">
        <div className="step-header">
          <span className="step-label">Line</span>
          <span className="step-counter">
            {currentStep + 1} / {totalSteps}
          </span>
        </div>
        {stepData && (
          <div className="pin-info">
            <span className="pin-label">Pin {stepData.fromPin}</span>
            <span className="pin-arrow">→</span>
            <span className="pin-label">Pin {stepData.toPin}</span>
          </div>
        )}
      </div>

      <div className="step-buttons">
        <button
          className="step-btn step-btn-first"
          onClick={handleFirst}
          disabled={currentStep === 0}
          title="First step"
        >
          ⏮
        </button>

        <button
          className="step-btn step-btn-prev"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          title="Previous step"
        >
          ◀
        </button>

        <button
          className="step-btn step-btn-play"
          onClick={onPlayPause}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          className="step-btn step-btn-next"
          onClick={handleNext}
          disabled={currentStep === totalSteps - 1}
          title="Next step"
        >
          ▶
        </button>

        <button
          className="step-btn step-btn-last"
          onClick={handleLast}
          disabled={currentStep === totalSteps - 1}
          title="Last step"
        >
          ⏭
        </button>
      </div>

      <div className="step-slider-container">
        <input
          type="range"
          className="step-slider"
          min="0"
          max={totalSteps - 1}
          value={currentStep}
          onChange={handleSliderChange}
        />
      </div>
    </div>
  )
}

export default StepByStepControls
