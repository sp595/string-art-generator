import React, { useEffect, useState, lazy, Suspense, useCallback } from 'react'
import ImageUploader from './components/ImageUploader'
import ImageCropper from './components/ImageCropper'
import ParameterControls from './components/ParameterControls'
import StringArtCanvas from './components/StringArtCanvas'
import JSONImporter from './components/JSONImporter'
import Toast from './components/Toast'
import LandingHero from './components/LandingHero'
import AuthButton from './components/AuthButton'
import { generateStringArt } from './utils/stringArtAlgorithm'
import { generateAdvancedStringArt } from './utils/advancedStringArt'
import { buildPreviewSteps, buildManualInstructions } from './utils/stringArtCore'
import { useStringArtWorker } from './hooks/useStringArtWorker'
import { useAuth } from './hooks/useAuth'
import { useCloudSave } from './hooks/useCloudSave'
import { en } from './i18n/en'
import './App.css'

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
    canvasRadiusCm: 24,
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
  const [liveResult, setLiveResult] = useState(null)
  const [progress, setProgress] = useState(0)
  const [toast, setToast] = useState(null)

  const { generateWithWorker, terminateWorker } = useStringArtWorker()
  const { user, isConfigured } = useAuth()
  const { saves, saving, saveProgress, updateProgress, deleteSave, refreshSaves } = useCloudSave(user)

  // ── Persist result to localStorage ──────────────────────────────────────
  const RESULT_KEY = 'sa-last-result'

  // Restore on first load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESULT_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (!data?.lineSequence?.length) return
      const startPin = data.startPin ?? 0
      data.steps = buildPreviewSteps(data.lineSequence, 160, startPin)
      data.manualInstructions = buildManualInstructions(data.lineSequence, startPin)
      if (!data.stats) data.stats = { totalLines: data.lineSequence.length }
      setResult(data)
      if (data.parameters) setParameters(prev => ({ ...prev, ...data.parameters }))
    } catch {
      localStorage.removeItem(RESULT_KEY)
    }
  }, [])

  // Save whenever result changes
  useEffect(() => {
    if (!result) return
    try {
      // eslint-disable-next-line no-unused-vars
      const { steps, manualInstructions, ...toSave } = result
      localStorage.setItem(RESULT_KEY, JSON.stringify(toSave))
    } catch {
      // Storage full — ignore silently
    }
  }, [result])

  useEffect(() => {
    refreshSaves()
  }, [refreshSaves])

  useEffect(() => {
    return () => terminateWorker()
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
        stringArtResult = await generateWithWorker(image, parameters, setProgress, setLiveResult)
      } else {
        const generateFunction = parameters.useAdvancedAlgorithm
          ? generateAdvancedStringArt
          : generateStringArt

        stringArtResult = await generateFunction(image, parameters, setProgress)
      }

      setLiveResult(null)
      setResult(stringArtResult)
      showToast(en.toast.generated.replace('{lines}', stringArtResult.stats.totalLines), 'success')
    } catch (error) {
      showToast(en.toast.error, 'error')
    } finally {
      setLiveResult(null)
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleExport = () => {
    if (!result) return

    const { steps, manualInstructions, ...restData } = result
    const exportData = { ...restData, parameters }
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const link = document.createElement('a')
    link.setAttribute('href', dataUri)
    link.setAttribute('download', `string-art-${Date.now()}.json`)
    link.click()

    showToast(en.toast.jsonExported, 'success')
  }

  const handleJSONImport = (jsonData) => {
    try {
      const startPin = jsonData.startPin ?? 0

      if (!jsonData.steps && jsonData.lineSequence) {
        jsonData.steps = buildPreviewSteps(jsonData.lineSequence, 160, startPin)
        if (jsonData.stats) {
          jsonData.stats.totalSteps = jsonData.steps.length
        }
      }

      if (!jsonData.manualInstructions && jsonData.lineSequence) {
        jsonData.manualInstructions = buildManualInstructions(jsonData.lineSequence, startPin)
      }

      setResult(jsonData)

      if (jsonData.parameters) {
        setParameters(prev => ({ ...prev, ...jsonData.parameters }))
      }

      setImage(null)
      setOriginalImage(null)
      setShowCropper(false)

      showToast('String art importata con successo!', 'success')
    } catch (error) {
      showToast('Errore import JSON: ' + error.message, 'error')
    }
  }

  const handleLoadProgress = useCallback((restored, savedLine) => {
    // Rebuild steps if missing
    if (!restored.steps || restored.steps.length === 0) {
      const startPin = restored.startPin ?? 0
      restored.steps = buildPreviewSteps(restored.lineSequence, 160, startPin)
      if (restored.stats) restored.stats.previewSteps = restored.steps.length
    }

    setResult(restored)

    if (restored.parameters) {
      setParameters(prev => ({ ...prev, ...restored.parameters }))
    }
  }, [])

  const handleSaveProgress = useCallback(async (r, currentLine, name) => {
    await saveProgress(r, currentLine, name)
    showToast('Progresso salvato!', 'success')
  }, [saveProgress])

  const scrollToApp = () => {
    document.querySelector('.app-content')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <LandingHero onGetStarted={scrollToApp} />

      <Suspense fallback={<div style={{ minHeight: '200px' }} />}>
        <Benefits />
        <HowItWorks />
        <AdBanner slot="1418183247" format="horizontal" />
      </Suspense>

      <div className="app">
        <header className="app-header">
          <h2>{en.header.title}</h2>
          <p>{en.header.subtitle}</p>
          <div className="app-header-auth">
            <AuthButton />
          </div>
        </header>

        <div className="app-content">
          <div className="left-panel">
            <ImageUploader onImageUpload={handleImageUpload} currentImage={image} />
            <JSONImporter onJSONImport={handleJSONImport} onNotify={showToast} />
            <ParameterControls
              parameters={parameters}
              onParameterChange={handleParameterChange}
              disabled={isProcessing}
            />

            {!result && saves.length > 0 && (
              <div className="saved-sessions-panel">
                <div className="saved-sessions-title">Sessioni salvate</div>
                {saves.map(save => (
                  <div key={save.id} className="saved-session-item">
                    <div className="saved-session-info">
                      <span className="saved-session-name">{save.name}</span>
                      <span className="saved-session-meta">
                        Linea {(save.currentLine ?? 0) + 1} / {save.lineSequence?.length ?? '?'}
                        {' · '}{new Date(save.savedAt).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    <button
                      className="saved-session-load"
                      onClick={() => handleLoadProgress(save)}
                    >
                      Riprendi
                    </button>
                  </div>
                ))}
              </div>
            )}

            {result && (
              <div className="actions">
                <button className="btn-secondary" onClick={handleExport}>
                  {en.actions.export}
                </button>
              </div>
            )}
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
              <>
              <StringArtCanvas
                image={image}
                result={result}
                liveResult={liveResult}
                parameters={parameters}
                isProcessing={isProcessing}
                progress={progress}
                onNotify={showToast}
                onEditCrop={originalImage ? () => setShowCropper(true) : null}
                user={user}
                saves={saves}
                saving={saving}
                onSaveProgress={handleSaveProgress}
                onLoadProgress={handleLoadProgress}
                onDeleteSave={deleteSave}
                isConfigured={isConfigured}
              />
              <div className="actions actions-right">
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
              </div>
              </>
            )}
          </div>
        </div>

        <Suspense fallback={<div style={{ minHeight: '100px' }} />}>
          <AdBanner slot="5844513418" format="horizontal" />
          <FAQ />
          <AdBanner slot="9552534575" format="square" />
        </Suspense>
      </div>

      <Suspense fallback={<div style={{ minHeight: '100px' }} />}>
        <SEOFooter />
      </Suspense>
    </>
  )
}

export default App
