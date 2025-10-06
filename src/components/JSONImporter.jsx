import React, { useRef } from 'react'
import './JSONImporter.css'

/**
 * JSON Importer Component
 * Allows importing previously exported string art JSON files
 */
function JSONImporter({ onJSONImport }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/json') {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result)

          // Validate JSON structure
          if (!jsonData.lineSequence || !jsonData.pinCoords || !jsonData.parameters) {
            throw new Error('Invalid string art JSON format')
          }

          onJSONImport(jsonData)
        } catch (error) {
          alert('Error loading JSON: ' + error.message)
        }
      }

      reader.readAsText(file)
    } else {
      alert('Please select a valid JSON file')
    }

    // Reset input to allow re-importing the same file
    event.target.value = ''
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="json-importer">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button
        className="btn-import-json"
        onClick={handleClick}
        title="Import previously exported string art"
      >
        <svg
          className="import-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="20"
          height="20"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>
        Import JSON
      </button>
    </div>
  )
}

export default JSONImporter
