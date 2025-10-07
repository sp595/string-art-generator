/**
 * Web Worker for String Art Generation
 * Runs the algorithm in a separate thread to avoid blocking the UI
 */

// Import algorithm functions (we'll inline them for the worker)
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

      lineCache[j * pins + i] = pixels
      lineCache[i * pins + j] = pixels
    }
  }

  return lineCache
}

function calculateLineError(errorArray, linePixels, imageSize) {
  let sum = 0
  for (const pixel of linePixels) {
    sum += errorArray[pixel.y * imageSize + pixel.x]
  }
  return sum
}

function updateErrorArray(errorArray, linePixels, lineWeight, imageSize) {
  for (const pixel of linePixels) {
    const idx = pixel.y * imageSize + pixel.x
    errorArray[idx] = Math.max(0, errorArray[idx] - lineWeight)
  }
}

// Listen for messages from main thread
self.onmessage = function(e) {
  const { imageData, parameters } = e.data
  const { pins, minDistance, maxLines, lineWeight, imageSize } = parameters

  // Convert image to grayscale
  const sourcePixels = new Float32Array(imageSize * imageSize)
  for (let y = 0; y < imageSize; y++) {
    for (let x = 0; x < imageSize; x++) {
      const idx = (y * imageSize + x) * 4
      const gray = 0.299 * imageData[idx] + 0.587 * imageData[idx + 1] + 0.114 * imageData[idx + 2]
      sourcePixels[y * imageSize + x] = gray
    }
  }

  self.postMessage({ type: 'progress', progress: 10 })

  // Initialize error array
  const errorArray = new Float32Array(imageSize * imageSize)
  for (let i = 0; i < errorArray.length; i++) {
    errorArray[i] = 255 - sourcePixels[i]
  }

  const pinCoords = calculatePinCoords(pins, imageSize)

  self.postMessage({ type: 'progress', progress: 20 })

  const lineCache = precalculateLines(pinCoords, pins, minDistance)

  self.postMessage({ type: 'progress', progress: 30 })

  // Main algorithm
  const lineSequence = []
  const steps = [] // Store each line as a step
  let currentPin = 0
  const recentPins = new Array(20).fill(-1)

  for (let i = 0; i < maxLines; i++) {
    let bestPin = -1
    let maxError = 0

    for (let offset = minDistance; offset < pins - minDistance; offset++) {
      const testPin = (currentPin + offset) % pins

      if (recentPins.includes(testPin)) continue

      const linePixels = lineCache[testPin * pins + currentPin]
      if (!linePixels) continue

      const lineError = calculateLineError(errorArray, linePixels, imageSize)

      if (lineError > maxError) {
        maxError = lineError
        bestPin = testPin
      }
    }

    if (bestPin === -1) break

    lineSequence.push(bestPin)

    // Save each line as a step
    steps.push({
      lineCount: lineSequence.length,
      lineSequence: [...lineSequence], // Clone array
      fromPin: currentPin,
      toPin: bestPin
    })

    const linePixels = lineCache[bestPin * pins + currentPin]
    updateErrorArray(errorArray, linePixels, lineWeight, imageSize)

    recentPins.shift()
    recentPins.push(bestPin)

    currentPin = bestPin

    if (i % 100 === 0) {
      self.postMessage({
        type: 'progress',
        progress: 30 + Math.floor((i / maxLines) * 70)
      })
    }
  }

  self.postMessage({ type: 'progress', progress: 100 })

  // Send result back
  self.postMessage({
    type: 'complete',
    result: {
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
  })
}
