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

export async function generateStringArt(image, parameters, onProgress) {
  const imageData = extractImageData(image, parameters.imageSize)

  return generateStringArtFromImageData(
    imageData,
    parameters,
    onProgress,
    {
      useEdgeDetection: false,
      useLookahead: false,
      useAntialiasing: false,
      edgeWeight: 0.35
    }
  )
}
