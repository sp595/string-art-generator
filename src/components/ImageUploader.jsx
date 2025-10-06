import React, { useRef, useState } from 'react'
import { en } from '../i18n/en'
import './ImageUploader.css'

function ImageUploader({ onImageUpload, currentImage }) {
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()

      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          setPreview(e.target.result)
          onImageUpload(img)
        }
        img.src = e.target.result
      }

      reader.readAsDataURL(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const fakeEvent = { target: { files: [file] } }
      handleFileChange(fakeEvent)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  return (
    <div className="image-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div
        className="upload-area"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {currentImage || preview ? (
          <div className="preview-container">
            <img
              src={currentImage?.src || preview}
              alt="Preview"
              className="preview-image"
              style={{ objectFit: 'contain' }}
            />
            <div className="change-overlay">{en.uploader.change}</div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <svg
              className="upload-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p>{en.uploader.dropzone}</p>
            <span>{en.uploader.formats}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageUploader
