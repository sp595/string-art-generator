/**
 * Advanced String Art Algorithm - Optimized Version
 *
 * Improvements:
 * 1. Weighted Error Function - prioritizes edges and important areas
 * 2. Adaptive Line Weight - adjusts based on image characteristics
 * 3. Edge Detection (Sobel) - focuses on edges for better quality
 * 4. Look-ahead Algorithm - considers future steps for better choices
 * 5. Anti-aliasing (Wu's algorithm) - smoother lines
 */

/**
 * Sobel edge detection for importance weighting
 */
function detectEdges(pixels, imageSize) {
  const edges = new Float32Array(imageSize * imageSize)

  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]

  for (let y = 1; y < imageSize - 1; y++) {
    for (let x = 1; x < imageSize - 1; x++) {
      let gx = 0, gy = 0

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * imageSize + (x + kx)
          const kidx = (ky + 1) * 3 + (kx + 1)
          gx += pixels[idx] * sobelX[kidx]
          gy += pixels[idx] * sobelY[kidx]
        }
      }

      edges[y * imageSize + x] = Math.sqrt(gx * gx + gy * gy)
    }
  }

  // Normalize
  let max = 0
  for (let i = 0; i < edges.length; i++) {
    if (edges[i] > max) max = edges[i]
  }
  if (max > 0) {
    for (let i = 0; i < edges.length; i++) {
      edges[i] /= max
    }
  }

  return edges
}

/**
 * Create importance weight map combining edges and darkness
 */
function createImportanceMap(pixels, edges, imageSize, edgeWeight = 0.7) {
  const importance = new Float32Array(imageSize * imageSize)

  for (let i = 0; i < importance.length; i++) {
    // Combine edge strength and pixel darkness
    const darkness = 1 - (pixels[i] / 255)
    const edgeStrength = edges[i]

    // Weighted combination
    importance[i] = edgeWeight * edgeStrength + (1 - edgeWeight) * darkness
  }

  return importance
}

/**
 * Wu's anti-aliased line algorithm for smoother rendering
 */
function getLinePixelsWu(x0, y0, x1, y1) {
  const pixels = []

  const steep = Math.abs(y1 - y0) > Math.abs(x1 - x0)

  if (steep) {
    [x0, y0] = [y0, x0];
    [x1, y1] = [y1, x1]
  }
  if (x0 > x1) {
    [x0, x1] = [x1, x0];
    [y0, y1] = [y1, y0]
  }

  const dx = x1 - x0
  const dy = y1 - y0
  const gradient = dx === 0 ? 1 : dy / dx

  let y = y0
  for (let x = x0; x <= x1; x++) {
    const yInt = Math.floor(y)
    const yFrac = y - yInt

    if (steep) {
      pixels.push({ x: yInt, y: x, alpha: 1 - yFrac })
      pixels.push({ x: yInt + 1, y: x, alpha: yFrac })
    } else {
      pixels.push({ x: x, y: yInt, alpha: 1 - yFrac })
      pixels.push({ x: x, y: yInt + 1, alpha: yFrac })
    }

    y += gradient
  }

  return pixels
}

/**
 * Calculate pin positions
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
 * Bresenham's line algorithm (faster for pre-caching)
 */
function getLinePixelsBresenham(x0, y0, x1, y1) {
  const pixels = []
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy

  let x = x0
  let y = y0

  while (true) {
    pixels.push({ x, y, alpha: 1 })

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
 * Pre-calculate all lines
 */
function precalculateLines(pinCoords, pins, minDistance, useAntialiasing = false) {
  const lineCache = new Array(pins * pins)

  for (let i = 0; i < pins; i++) {
    for (let j = i + minDistance; j < pins; j++) {
      const pixels = useAntialiasing
        ? getLinePixelsWu(pinCoords[i].x, pinCoords[i].y, pinCoords[j].x, pinCoords[j].y)
        : getLinePixelsBresenham(pinCoords[i].x, pinCoords[i].y, pinCoords[j].x, pinCoords[j].y)

      lineCache[j * pins + i] = pixels
      lineCache[i * pins + j] = pixels
    }
  }

  return lineCache
}

/**
 * Convert image to grayscale
 */
function imageToGrayscale(imageData, imageSize) {
  const pixels = new Float32Array(imageSize * imageSize)

  for (let y = 0; y < imageSize; y++) {
    for (let x = 0; x < imageSize; x++) {
      const idx = (y * imageSize + x) * 4
      const gray = 0.299 * imageData[idx] + 0.587 * imageData[idx + 1] + 0.114 * imageData[idx + 2]
      pixels[y * imageSize + x] = gray
    }
  }

  return pixels
}

/**
 * Calculate weighted error for a line
 */
function calculateWeightedLineError(errorArray, importanceMap, linePixels, imageSize) {
  let sum = 0
  for (const pixel of linePixels) {
    if (pixel.x < 0 || pixel.x >= imageSize || pixel.y < 0 || pixel.y >= imageSize) continue

    const idx = pixel.y * imageSize + pixel.x
    const alpha = pixel.alpha || 1
    const error = errorArray[idx] * alpha
    const importance = importanceMap[idx]

    // Weighted by importance
    sum += error * importance
  }
  return sum
}

/**
 * Update error array with adaptive weight
 */
function updateErrorArray(errorArray, linePixels, lineWeight, imageSize) {
  for (const pixel of linePixels) {
    if (pixel.x < 0 || pixel.x >= imageSize || pixel.y < 0 || pixel.y >= imageSize) continue

    const idx = pixel.y * imageSize + pixel.x
    const alpha = pixel.alpha || 1
    errorArray[idx] = Math.max(0, errorArray[idx] - lineWeight * alpha)
  }
}

/**
 * Look-ahead: evaluate potential future impact of choosing a pin
 * Simplified version to avoid performance issues
 */
function evaluateWithLookahead(currentPin, testPin, errorArray, importanceMap, lineCache,
                                pins, minDistance, recentPins, lookaheadDepth, imageSize, lineWeight) {
  // Score for immediate line
  let immediatePixels = lineCache[testPin * pins + currentPin]
  if (!immediatePixels) return 0

  let immediateScore = calculateWeightedLineError(errorArray, importanceMap, immediatePixels, imageSize)

  if (lookaheadDepth === 0) return immediateScore

  // Simplified look-ahead: only check a few strategic pins
  let maxFutureScore = 0

  // Check only 3 strategic positions to reduce computation
  const checkOffsets = [minDistance, Math.floor(pins / 4), Math.floor(pins / 2)]

  for (const offset of checkOffsets) {
    if (offset >= pins - minDistance) continue

    const futurePin = (testPin + offset) % pins
    if (recentPins.includes(futurePin)) continue

    const futurePixels = lineCache[futurePin * pins + testPin]
    if (!futurePixels) continue

    // Quick score without creating temp array
    let futureScore = 0
    for (const pixel of futurePixels) {
      if (pixel.x < 0 || pixel.x >= imageSize || pixel.y < 0 || pixel.y >= imageSize) continue
      const idx = pixel.y * imageSize + pixel.x
      const remainingError = Math.max(0, errorArray[idx] - lineWeight * (pixel.alpha || 1))
      futureScore += remainingError * importanceMap[idx]
    }

    if (futureScore > maxFutureScore) {
      maxFutureScore = futureScore
    }
  }

  // Combined score with reduced future weight
  return immediateScore + 0.1 * maxFutureScore
}

/**
 * Calculate adaptive line weight based on iteration
 */
function calculateAdaptiveLineWeight(baseWeight, iteration, maxLines) {
  // Start heavier, gradually lighten
  const progressFactor = iteration / maxLines
  const adaptiveFactor = 1 - 0.3 * progressFactor

  return baseWeight * adaptiveFactor
}

/**
 * Main advanced string art algorithm
 */
export async function generateAdvancedStringArt(image, parameters, onProgress) {
  const {
    pins,
    minDistance,
    maxLines,
    lineWeight: baseLineWeight,
    imageSize,
    useEdgeDetection = true,
    useLookahead = true,
    useAntialiasing = false,
    edgeWeight = 0.7,
    lookaheadDepth = 1
  } = parameters

  const canvas = document.createElement('canvas')
  canvas.width = imageSize
  canvas.height = imageSize
  const ctx = canvas.getContext('2d')

  ctx.drawImage(image, 0, 0, imageSize, imageSize)
  const imageData = ctx.getImageData(0, 0, imageSize, imageSize).data

  const sourcePixels = imageToGrayscale(imageData, imageSize)

  onProgress?.(5)

  // Detect edges for importance weighting
  const edges = useEdgeDetection ? detectEdges(sourcePixels, imageSize) : new Float32Array(imageSize * imageSize)

  onProgress?.(10)

  // Create importance map
  const importanceMap = useEdgeDetection
    ? createImportanceMap(sourcePixels, edges, imageSize, edgeWeight)
    : new Float32Array(imageSize * imageSize).fill(1)

  onProgress?.(15)

  // Initialize error array
  const errorArray = new Float32Array(imageSize * imageSize)
  for (let i = 0; i < errorArray.length; i++) {
    errorArray[i] = 255 - sourcePixels[i]
  }

  const pinCoords = calculatePinCoords(pins, imageSize)

  onProgress?.(20)

  const lineCache = precalculateLines(pinCoords, pins, minDistance, useAntialiasing)

  onProgress?.(30)

  // Main greedy algorithm with improvements
  const lineSequence = []
  const steps = [] // Store each line as a step
  let currentPin = 0
  const recentPins = new Array(20).fill(-1)

  for (let i = 0; i < maxLines; i++) {
    let bestPin = -1
    let maxScore = 0

    // Adaptive line weight
    const lineWeight = calculateAdaptiveLineWeight(baseLineWeight, i, maxLines)

    for (let offset = minDistance; offset < pins - minDistance; offset++) {
      const testPin = (currentPin + offset) % pins
      if (recentPins.includes(testPin)) continue

      const score = useLookahead
        ? evaluateWithLookahead(currentPin, testPin, errorArray, importanceMap, lineCache,
                                pins, minDistance, recentPins, lookaheadDepth, imageSize, lineWeight)
        : calculateWeightedLineError(errorArray, importanceMap, lineCache[testPin * pins + currentPin], imageSize)

      if (score > maxScore) {
        maxScore = score
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

    // Yield to UI every 100 iterations
    if (i % 100 === 0) {
      onProgress?.(30 + Math.floor((i / maxLines) * 70))
      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  onProgress?.(100)

  return {
    lineSequence,
    pinCoords,
    steps, // Include steps for visualization
    parameters: {
      pins,
      minDistance,
      maxLines,
      lineWeight: baseLineWeight,
      imageSize,
      useEdgeDetection,
      useLookahead,
      useAntialiasing,
      edgeWeight,
      lookaheadDepth
    },
    stats: {
      totalLines: lineSequence.length,
      totalSteps: steps.length,
      generatedAt: new Date().toISOString()
    }
  }
}
