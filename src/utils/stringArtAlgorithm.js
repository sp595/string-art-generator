/**
 * String Art Algorithm - Optimized Version
 * Based on research from computational string art papers
 * Uses greedy error minimization with pre-cached line coordinates
 */

/**
 * Calculate pin positions evenly distributed on a circle
 */
function calculatePinCoords(pins, imageSize) {
  const center = imageSize / 2
  const radius = imageSize / 2 - 1
  const pinCoords = []

  for (let i = 0; i < pins; i++) {
    const angle = (2 * Math.PI * i) / pins
    pinCoords.push({
      x: Math.floor(center + radius * Math.cos(angle)),
      y: Math.floor(center + radius * Math.sin(angle))
    })
  }

  return pinCoords
}

/**
 * Get pixel coordinates between two points using Bresenham's line algorithm
 * More efficient than linear interpolation
 */
function getLinePixels(x0, y0, x1, y1) {
  const pixels = []
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy

  let x = x0
  let y = y0

  while (true) {
    pixels.push({ x, y })

    if (x === x1 && y === y1) break

    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x += sx
    }
    if (e2 < dx) {
      err += dx
      y += sy
    }
  }

  return pixels
}

/**
 * Pre-calculate all possible lines between pins
 * This optimization dramatically speeds up the main algorithm
 */
function precalculateLines(pinCoords, pins, minDistance) {
  const lineCache = new Array(pins * pins)

  for (let i = 0; i < pins; i++) {
    for (let j = i + minDistance; j < pins; j++) {
      const pixels = getLinePixels(
        pinCoords[i].x,
        pinCoords[i].y,
        pinCoords[j].x,
        pinCoords[j].y
      )

      // Store bidirectionally
      lineCache[j * pins + i] = pixels
      lineCache[i * pins + j] = pixels
    }
  }

  return lineCache
}

/**
 * Convert image to grayscale pixel array
 */
function imageToGrayscale(imageData, imageSize) {
  const pixels = new Float32Array(imageSize * imageSize)

  for (let y = 0; y < imageSize; y++) {
    for (let x = 0; x < imageSize; x++) {
      const idx = (y * imageSize + x) * 4
      // Use luminance formula for better grayscale conversion
      const gray = 0.299 * imageData[idx] + 0.587 * imageData[idx + 1] + 0.114 * imageData[idx + 2]
      pixels[y * imageSize + x] = gray
    }
  }

  return pixels
}

/**
 * Calculate error (difference) for a potential line
 */
function calculateLineError(errorArray, linePixels, imageSize) {
  let sum = 0
  for (const pixel of linePixels) {
    sum += errorArray[pixel.y * imageSize + pixel.x]
  }
  return sum
}

/**
 * Update error array after drawing a line
 */
function updateErrorArray(errorArray, linePixels, lineWeight, imageSize) {
  for (const pixel of linePixels) {
    const idx = pixel.y * imageSize + pixel.x
    errorArray[idx] = Math.max(0, errorArray[idx] - lineWeight)
  }
}

/**
 * Main string art generation algorithm
 * Uses greedy approach to minimize error at each step
 */
export async function generateStringArt(image, parameters, onProgress) {
  const { pins, minDistance, maxLines, lineWeight, imageSize } = parameters

  // Create canvas to process image
  const canvas = document.createElement('canvas')
  canvas.width = imageSize
  canvas.height = imageSize
  const ctx = canvas.getContext('2d')

  // Draw and resize image
  ctx.drawImage(image, 0, 0, imageSize, imageSize)
  const imageData = ctx.getImageData(0, 0, imageSize, imageSize).data

  // Convert to grayscale
  const sourcePixels = imageToGrayscale(imageData, imageSize)

  // Initialize error array (inverted: white=255, black=0)
  const errorArray = new Float32Array(imageSize * imageSize)
  for (let i = 0; i < errorArray.length; i++) {
    errorArray[i] = 255 - sourcePixels[i]
  }

  // Calculate pin positions
  const pinCoords = calculatePinCoords(pins, imageSize)

  // Pre-calculate all lines
  onProgress?.(10)
  const lineCache = precalculateLines(pinCoords, pins, minDistance)

  onProgress?.(20)

  // Main algorithm: greedy line selection
  const lineSequence = []
  const steps = [] // Store each line as a step
  let currentPin = 0
  const recentPins = new Array(20).fill(-1)

  for (let i = 0; i < maxLines; i++) {
    let bestPin = -1
    let maxError = 0

    // Try all possible next pins
    for (let offset = minDistance; offset < pins - minDistance; offset++) {
      const testPin = (currentPin + offset) % pins

      // Skip recently used pins
      if (recentPins.includes(testPin)) continue

      // Calculate error for this line
      const linePixels = lineCache[testPin * pins + currentPin]
      if (!linePixels) continue

      const lineError = calculateLineError(errorArray, linePixels, imageSize)

      if (lineError > maxError) {
        maxError = lineError
        bestPin = testPin
      }
    }

    if (bestPin === -1) break

    // Add line to sequence
    lineSequence.push(bestPin)

    // Save each line as a step
    steps.push({
      lineCount: lineSequence.length,
      lineSequence: [...lineSequence], // Clone array
      fromPin: currentPin,
      toPin: bestPin
    })

    // Update error array
    const linePixels = lineCache[bestPin * pins + currentPin]
    updateErrorArray(errorArray, linePixels, lineWeight, imageSize)

    // Update recent pins
    recentPins.shift()
    recentPins.push(bestPin)

    currentPin = bestPin

    // Update progress
    if (i % 100 === 0) {
      onProgress?.(20 + Math.floor((i / maxLines) * 80))
    }
  }

  onProgress?.(100)

  return {
    lineSequence,
    pinCoords,
    steps, // Include steps for visualization (not exported)
    parameters: {
      pins,
      minDistance,
      maxLines,
      lineWeight,
      imageSize
    },
    stats: {
      totalLines: lineSequence.length,
      generatedAt: new Date().toISOString()
    }
  }
}
