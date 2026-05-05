import React, { useRef } from 'react'
import AppIcon from './AppIcon'
import { en } from '../i18n/en'
import './JSONImporter.css'

/**
 * JSON Importer Component
 * Allows importing previously exported string art JSON files
 */
function JSONImporter({ onJSONImport, onNotify }) {
  const fileInputRef = useRef(null)
  const { jsonImporter, toast } = en

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/json') {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result)

          // Validate JSON structure
          if (!jsonData.lineSequence || !jsonData.pinCoords || !jsonData.parameters) {
            throw new Error(jsonImporter.invalidFormat)
          }

          onJSONImport(jsonData)
          onNotify?.(jsonImporter.imported, 'success')
        } catch (error) {
          onNotify?.(`${toast.jsonImportError} ${error.message}`, 'error')
        }
      }

      reader.readAsText(file)
    } else {
      onNotify?.(jsonImporter.invalidFile, 'error')
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
        title={jsonImporter.title}
      >
        <AppIcon name="upload" size={18} className="import-icon" />
        {jsonImporter.button}
      </button>
    </div>
  )
}

export default JSONImporter
