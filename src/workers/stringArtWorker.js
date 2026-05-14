import { generateStringArtFromImageData } from '../utils/stringArtCore'

self.onmessage = async function(event) {
  const { imageData, parameters } = event.data

  try {
    const result = await generateStringArtFromImageData(
      imageData,
      parameters,
      (progress) => {
        self.postMessage({ type: 'progress', progress })
      },
      {
        useEdgeDetection: parameters.useAdvancedAlgorithm !== false,
        useLookahead: parameters.useAdvancedAlgorithm !== false,
        useAntialiasing: false,
        edgeWeight: 0.65,
        lookaheadDepth: 1
      },
      (liveData) => {
        self.postMessage({ type: 'live', ...liveData })
      }
    )

    self.postMessage({ type: 'progress', progress: 100 })
    self.postMessage({
      type: 'complete',
      result
    })
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
