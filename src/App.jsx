import React, { useEffect, useState, lazy, Suspense } from 'react'
import ImageUploader from './components/ImageUploader'
import ImageCropper from './components/ImageCropper'
import ParameterControls from './components/ParameterControls'
import StringArtCanvas from './components/StringArtCanvas'
import JSONImporter from './components/JSONImporter'
import Toast from './components/Toast'
import LandingHero from './components/LandingHero'
import { generateStringArt } from './utils/stringArtAlgorithm'
import { generateAdvancedStringArt } from './utils/advancedStringArt'
import { buildPreviewSteps } from './utils/stringArtCore'
import { useStringArtWorker } from './hooks/useStringArtWorker'
import { en } from './i18n/en'
import './App.css'

// Lazy load non-critical components for better FCP
const FAQ = lazy(() => import('./components/FAQ'))
const AdBanner = lazy(() => import('./components/AdBanner'))
const HowItWorks = lazy(() => import('./components/HowItWorks'))
const Benefits = lazy(() => import('./components/Benefits'))
const SEOFooter = lazy(() => import('./components/SEOFooter'))

function App() {
  const [originalImage, setOriginalImage] = useState(null)
  const [image, setImage] = useState(null)
  const [showCropper, setShowCropper] = useState(false)
  const [parameters, setParameters] = useState({
    pins: 280,
    minDistance: 24,
    maxLines: 4200,
    lineWeight: 12,
    imageSize: 700,
    useAdvancedAlgorithm: true,
    useEdgeDetection: true,
    useLookahead: true,
    useAntialiasing: false,
    useWebWorker: true,
    edgeWeight: 0.65,
    lookaheadDepth: 1
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState(0)
  const [toast, setToast] = useState(null)

  const { generateWithWorker, terminateWorker } = useStringArtWorker()

  useEffect(() => {
    return () => {
      terminateWorker()
    }
  }, [terminateWorker])

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
    // Keep originalImage so user can re-edit crop
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

      if (parameters.useWebWorker) {
        stringArtResult = await generateWithWorker(
          image,
          parameters,
          (progressValue) => setProgress(progressValue)
        )
      } else {
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

    // Export without steps array (too large) and with all UI parameters
    const { steps, ...restData } = result
    const exportData = {
      ...restData,
      parameters: parameters // Use all UI parameters instead of algorithm-specific ones
    }
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `string-art-${Date.now()}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    showToast(en.toast.jsonExported, 'success')
  }

  const handleJSONImport = (jsonData) => {
    try {
      // Generate steps if they don't exist (for backward compatibility)
      if (!jsonData.steps && jsonData.lineSequence) {
        const steps = buildPreviewSteps(jsonData.lineSequence)
        jsonData.steps = steps
        if (jsonData.stats) {
          jsonData.stats.totalSteps = steps.length
        }
      }

      // Set the result from imported JSON
      setResult(jsonData)

      // Update parameters if they exist
      if (jsonData.parameters) {
        setParameters(prev => ({
          ...prev,
          ...jsonData.parameters
        }))
      }

      // Clear current image and cropper
      setImage(null)
      setOriginalImage(null)
      setShowCropper(false)

      showToast('String art imported successfully!', 'success')
    } catch (error) {
      showToast('Error importing JSON: ' + error.message, 'error')
    }
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

      <Suspense fallback={<div style={{ minHeight: '200px' }} />}>
        {/* Benefits Section - SEO Content */}
        <Benefits />

        {/* How It Works Section - SEO Content */}
        <HowItWorks />

        {/* Top Ad Banner - After Hero Section */}
        <AdBanner slot="1418183247" format="horizontal" />
      </Suspense>

      <div className="app">
        <header className="app-header">
          <h2>{en.header.title}</h2>
          <p>{en.header.subtitle}</p>
        </header>

      <div className="app-content">
        <div className="left-panel">
          <ImageUploader
            onImageUpload={handleImageUpload}
            currentImage={image}
          />

          <JSONImporter onJSONImport={handleJSONImport} onNotify={showToast} />

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
              onEditCrop={originalImage ? () => setShowCropper(true) : null}
            />
          )}
        </div>
      </div>

      <Suspense fallback={<div style={{ minHeight: '100px' }} />}>
        {/* Bottom Ad Banner - Before FAQ */}
        <AdBanner slot="5844513418" format="horizontal" />

        <FAQ />


        {/* Ad Banner - Below Preview */}
        <AdBanner slot="9552534575" format="square" />
      </Suspense>
    </div>

      <Suspense fallback={<div style={{ minHeight: '100px' }} />}>
        {/* SEO Footer */}
        <SEOFooter />
      </Suspense>
    </>
  )
}

export default App
