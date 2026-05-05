import { generateStringArtFromImageData } from './stringArtCore'

function extractImageData(image, imageSize) {
  const canvas = document.createElement('canvas')
  canvas.width = imageSize
  canvas.height = imageSize

  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, imageSize, imageSize)

  return ctx.getImageData(0, 0, imageSize, imageSize).data
}

export async function generateAdvancedStringArt(image, parameters, onProgress) {
  const imageData = extractImageData(image, parameters.imageSize)

  return generateStringArtFromImageData(
    imageData,
    parameters,
    onProgress,
    {
      useEdgeDetection: true,
      useLookahead: true,
      useAntialiasing: false,
      edgeWeight: 0.65,
      lookaheadDepth: 1
    }
  )
}
