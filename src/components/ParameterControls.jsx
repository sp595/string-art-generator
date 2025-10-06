import React, { useState } from 'react'
import { en } from '../i18n/en'
import './ParameterControls.css'

function ParameterControls({ parameters, onParameterChange, disabled }) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleChange = (param, value) => {
    const parsedValue = ['useEdgeDetection', 'useLookahead', 'useAntialiasing', 'useAdvancedAlgorithm', 'useWebWorker'].includes(param)
      ? value
      : parseFloat(value)

    onParameterChange({
      ...parameters,
      [param]: parsedValue
    })
  }

  const controls = [
    {
      name: 'pins',
      label: en.parameters.pins.label,
      min: 100,
      max: 400,
      step: 10,
      description: en.parameters.pins.description
    },
    {
      name: 'minDistance',
      label: en.parameters.minDistance.label,
      min: 10,
      max: 80,
      step: 5,
      description: en.parameters.minDistance.description
    },
    {
      name: 'maxLines',
      label: en.parameters.maxLines.label,
      min: 1000,
      max: 5000,
      step: 250,
      description: en.parameters.maxLines.description
    },
    {
      name: 'lineWeight',
      label: en.parameters.lineWeight.label,
      min: 5,
      max: 25,
      step: 1,
      description: en.parameters.lineWeight.description
    },
    {
      name: 'imageSize',
      label: en.parameters.imageSize.label,
      min: 400,
      max: 800,
      step: 50,
      description: en.parameters.imageSize.description
    }
  ]

  return (
    <div className="parameter-controls">
      <h3>{en.parameters.title}</h3>

      {controls.map((control) => (
        <div key={control.name} className="control-group">
          <div className="control-header">
            <label htmlFor={control.name}>{control.label}</label>
            <span className="control-value">{parameters[control.name]}</span>
          </div>

          <input
            type="range"
            id={control.name}
            min={control.min}
            max={control.max}
            step={control.step}
            value={parameters[control.name]}
            onChange={(e) => handleChange(control.name, e.target.value)}
            disabled={disabled}
            className="control-slider"
          />

          <p className="control-description">{control.description}</p>
        </div>
      ))}

      <div className="advanced-section">
        <button
          className="toggle-advanced"
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={disabled}
        >
          {showAdvanced ? '▼' : '▶'} {en.advanced.toggle}
        </button>

        {showAdvanced && (
          <div className="advanced-controls">
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={parameters.useWebWorker || false}
                  onChange={(e) => handleChange('useWebWorker', e.target.checked)}
                  disabled={disabled || parameters.useAdvancedAlgorithm}
                />
                {en.advanced.webWorker.label}
              </label>
              <p className="control-description">
                {en.advanced.webWorker.description}
              </p>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={parameters.useAdvancedAlgorithm || false}
                  onChange={(e) => handleChange('useAdvancedAlgorithm', e.target.checked)}
                  disabled={disabled}
                />
                {en.advanced.algorithm.label}
              </label>
              <p className="control-description">
                {en.advanced.algorithm.description}
              </p>
            </div>

            {parameters.useAdvancedAlgorithm && (
              <>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={parameters.useEdgeDetection !== false}
                      onChange={(e) => handleChange('useEdgeDetection', e.target.checked)}
                      disabled={disabled}
                    />
                    {en.advanced.edgeDetection.label}
                  </label>
                  <p className="control-description">{en.advanced.edgeDetection.description}</p>
                </div>

                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={parameters.useLookahead !== false}
                      onChange={(e) => handleChange('useLookahead', e.target.checked)}
                      disabled={disabled}
                    />
                    {en.advanced.lookahead.label}
                  </label>
                  <p className="control-description">{en.advanced.lookahead.description}</p>
                </div>

                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={parameters.useAntialiasing || false}
                      onChange={(e) => handleChange('useAntialiasing', e.target.checked)}
                      disabled={disabled}
                    />
                    {en.advanced.antialiasing.label}
                  </label>
                  <p className="control-description">{en.advanced.antialiasing.description}</p>
                </div>

                <div className="control-group">
                  <div className="control-header">
                    <label htmlFor="edgeWeight">{en.advanced.edgeWeight.label}</label>
                    <span className="control-value">
                      {(parameters.edgeWeight || 0.7).toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    id="edgeWeight"
                    min="0"
                    max="1"
                    step="0.1"
                    value={parameters.edgeWeight || 0.7}
                    onChange={(e) => handleChange('edgeWeight', e.target.value)}
                    disabled={disabled || !parameters.useEdgeDetection}
                    className="control-slider"
                  />
                  <p className="control-description">
                    {en.advanced.edgeWeight.description}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="info-box">
        <strong>{en.parameters.estimatedTime}</strong>{' '}
        {Math.ceil((parameters.maxLines * parameters.pins) / (parameters.useAdvancedAlgorithm ? 500000 : 1000000))} {en.parameters.seconds}
        {parameters.useAdvancedAlgorithm && (
          <div style={{ marginTop: '8px', color: '#ff6b6b' }}>
            ⚠️ {en.advanced.warnings.advanced}
          </div>
        )}
        {parameters.useLookahead && (
          <div style={{ marginTop: '4px', color: '#ff6b6b' }}>
            ⚠️ {en.advanced.warnings.lookahead}
          </div>
        )}
        {parameters.useAntialiasing && (
          <div style={{ marginTop: '4px', color: '#ff6b6b' }}>
            ⚠️ {en.advanced.warnings.antialiasing}
          </div>
        )}
      </div>
    </div>
  )
}

export default ParameterControls
