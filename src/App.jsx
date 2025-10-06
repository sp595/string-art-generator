import React, { useState, useRef } from 'react'
import ImageUploader from './components/ImageUploader'
import ImageCropper from './components/ImageCropper'
import ParameterControls from './components/ParameterControls'
import StringArtCanvas from './components/StringArtCanvas'
import Toast from './components/Toast'
import LandingHero from './components/LandingHero'
import FAQ from './components/FAQ'
import AdBanner from './components/AdBanner'
import { generateStringArt } from './utils/stringArtAlgorithm'
import { generateAdvancedStringArt } from './utils/advancedStringArt'
import { useStringArtWorker } from './hooks/useStringArtWorker'
import { en } from './i18n/en'
import './App.css'

function App() {
  const [originalImage, setOriginalImage] = useState(null)
  const [image, setImage] = useState(null)
  const [showCropper, setShowCropper] = useState(false)
  const [parameters, setParameters] = useState({
    pins: 300,
    minDistance: 30,
    maxLines: 3000,
    lineWeight: 15,
    imageSize: 600,
    useAdvancedAlgorithm: false,
    useEdgeDetection: true,
    useLookahead: false,  // Disabled by default for performance
    useAntialiasing: false,
    useWebWorker: true,  // Enabled by default for better UX
    edgeWeight: 0.7,
    lookaheadDepth: 1
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState(0)
  const [toast, setToast] = useState(null)

  const { generateWithWorker, terminateWorker } = useStringArtWorker()

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const handleImageUpload = (uploadedImage) => {
    setOriginalImage(uploadedImage)
    setImage(null)
    setResult(null)
    setProgress(0)
    setShowCropper(true)
    showToast(en.toast.imageLoaded, 'info')
  }

  const handleCropComplete = (croppedImage) => {
    setImage(croppedImage)
    setShowCropper(false)
    setOriginalImage(null)
    showToast(en.toast.imageCropped, 'success')
  }

  const handleParameterChange = (newParams) => {
    setParameters(newParams)
  }

  const handleGenerate = async () => {
    if (!image) return

    setIsProcessing(true)
    setProgress(0)

    try {
      let stringArtResult

      if (parameters.useWebWorker && !parameters.useAdvancedAlgorithm) {
        // Use Web Worker for basic algorithm (better performance)
        stringArtResult = await generateWithWorker(
          image,
          parameters,
          (progressValue) => setProgress(progressValue)
        )
      } else {
        // Use main thread for advanced algorithm or when worker is disabled
        const generateFunction = parameters.useAdvancedAlgorithm
          ? generateAdvancedStringArt
          : generateStringArt

        stringArtResult = await generateFunction(
          image,
          parameters,
          (progressValue) => setProgress(progressValue)
        )
      }

      setResult(stringArtResult)
      const message = en.toast.generated.replace('{lines}', stringArtResult.stats.totalLines)
      showToast(message, 'success')
    } catch (error) {
      console.error('Error generating string art:', error)
      showToast(en.toast.error, 'error')
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleExport = () => {
    if (!result) return

    const dataStr = JSON.stringify(result, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `string-art-${Date.now()}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    showToast(en.toast.jsonExported, 'success')
  }

  const scrollToApp = () => {
    const appContent = document.querySelector('.app-content')
    if (appContent) {
      appContent.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <LandingHero onGetStarted={scrollToApp} />

      {/* Top Ad Banner - After Hero Section */}
      <AdBanner slot="1418183247" format="horizontal" />

      <div className="app">
        <header className="app-header">
          <h1>{en.header.title}</h1>
          <p>{en.header.subtitle}</p>
        </header>

      <div className="app-content">
        <div className="left-panel">
          <ImageUploader
            onImageUpload={handleImageUpload}
            currentImage={image}
          />

          <ParameterControls
            parameters={parameters}
            onParameterChange={handleParameterChange}
            disabled={isProcessing}
          />

          <div className="actions">
            <button
              className={`btn-primary ${isProcessing ? 'processing' : ''}`}
              onClick={handleGenerate}
              disabled={!image || isProcessing}
            >
              {isProcessing ? (
                <span className="btn-content">
                  <span className="btn-spinner"></span>
                  {en.actions.generating}... {progress}%
                </span>
              ) : (
                en.actions.generate
              )}
            </button>

            {result && (
              <button
                className="btn-secondary"
                onClick={handleExport}
              >
                {en.actions.export}
              </button>
            )}

            {/* Sidebar Ad - Below Actions */}
            <AdBanner slot="9552534575" format="vertical" />
          </div>
        </div>

        <div className="right-panel">
          {showCropper ? (
            <div className="cropper-panel">
              <ImageCropper
                image={originalImage}
                targetSize={parameters.imageSize}
                onCropComplete={handleCropComplete}
              />
            </div>
          ) : (
            <StringArtCanvas
              image={image}
              result={result}
              parameters={parameters}
              isProcessing={isProcessing}
              progress={progress}
              onNotify={showToast}
              onEditCrop={() => setShowCropper(true)}
            />
          )}
        </div>
      </div>

      {/* Bottom Ad Banner - Before FAQ */}
      <AdBanner slot="5844513418" format="horizontal" />

      <FAQ />
    </div>
    </>
  )
}

export default App
