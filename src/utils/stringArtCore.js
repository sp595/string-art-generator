import { gaussianBlurGrayscale, unsharpMask, percentileStretch } from './imagePreprocessing'

const DEFAULT_PREVIEW_STEPS = 160

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function circularPinDistance(a, b, pins) {
  const direct = Math.abs(a - b)
  return Math.min(direct, pins - direct)
}

export function calculatePinCoords(pins, imageSize) {
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

function getLinePixelsWu(x0, y0, x1, y1) {
  const pixels = []
  const steep = Math.abs(y1 - y0) > Math.abs(x1 - x0)

  if (steep) {
    [x0, y0] = [y0, x0]
    [x1, y1] = [y1, x1]
  }
  if (x0 > x1) {
    [x0, x1] = [x1, x0]
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
      pixels.push({ x, y: yInt, alpha: 1 - yFrac })
      pixels.push({ x, y: yInt + 1, alpha: yFrac })
    }

    y += gradient
  }

  return pixels
}

function buildLineCache(pinCoords, pins, minDistance, useAntialiasing = false) {
  const lineCache = new Array(pins * pins)
  const lineBuilder = useAntialiasing ? getLinePixelsWu : getLinePixelsBresenham

  for (let i = 0; i < pins; i++) {
    for (let j = i + 1; j < pins; j++) {
      if (circularPinDistance(i, j, pins) < minDistance) continue

      const pixels = lineBuilder(
        pinCoords[i].x,
        pinCoords[i].y,
        pinCoords[j].x,
        pinCoords[j].y
      )

      const pairKey = i * pins + j
      const lineData = {
        pixels,
        length: pixels.length,
        pairKey
      }

      lineCache[i * pins + j] = lineData
      lineCache[j * pins + i] = lineData
    }
  }

  return lineCache
}

function imageToGrayscale(imageData, imageSize) {
  const pixels = new Float32Array(imageSize * imageSize)

  for (let y = 0; y < imageSize; y++) {
    for (let x = 0; x < imageSize; x++) {
      const idx = (y * imageSize + x) * 4
      pixels[y * imageSize + x] =
        0.299 * imageData[idx] +
        0.587 * imageData[idx + 1] +
        0.114 * imageData[idx + 2]
    }
  }

  return pixels
}

function buildCircleMask(imageSize) {
  const mask = new Uint8Array(imageSize * imageSize)
  const center = imageSize / 2
  const radius = imageSize / 2 - 2
  const radiusSquared = radius * radius

  for (let y = 0; y < imageSize; y++) {
    for (let x = 0; x < imageSize; x++) {
      const dx = x - center
      const dy = y - center
      if ((dx * dx) + (dy * dy) <= radiusSquared) {
        mask[y * imageSize + x] = 1
      }
    }
  }

  return mask
}

function normalizeInsideCircle(grayscalePixels, imageSize) {
  const mask = buildCircleMask(imageSize)

  // Preprocessing: blur → percentile stretch → unsharp mask
  const blurred = gaussianBlurGrayscale(grayscalePixels, imageSize)
  const stretched = percentileStretch(blurred, mask)
  const sharpened = unsharpMask(stretched, imageSize, 0.55)

  const pixels = new Float32Array(imageSize * imageSize)

  for (let i = 0; i < pixels.length; i++) {
    pixels[i] = mask[i] ? sharpened[i] : 255
  }

  return { pixels, mask }
}

function detectEdges(pixels, mask, imageSize) {
  const edges = new Float32Array(imageSize * imageSize)
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
  let max = 0

  for (let y = 1; y < imageSize - 1; y++) {
    for (let x = 1; x < imageSize - 1; x++) {
      const idx = y * imageSize + x
      if (!mask[idx]) continue

      let gx = 0
      let gy = 0

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const sampleIndex = (y + ky) * imageSize + (x + kx)
          const kernelIndex = ((ky + 1) * 3) + (kx + 1)
          gx += pixels[sampleIndex] * sobelX[kernelIndex]
          gy += pixels[sampleIndex] * sobelY[kernelIndex]
        }
      }

      const edgeStrength = Math.sqrt((gx * gx) + (gy * gy))
      edges[idx] = edgeStrength
      if (edgeStrength > max) max = edgeStrength
    }
  }

  if (max > 0) {
    for (let i = 0; i < edges.length; i++) {
      edges[i] /= max
    }
  }

  return edges
}

function createImportanceMap(sourcePixels, mask, edges, imageSize, edgeWeight) {
  const importance = new Float32Array(imageSize * imageSize)
  const clampedEdgeWeight = clamp(edgeWeight ?? 0.65, 0, 1)

  for (let i = 0; i < importance.length; i++) {
    if (!mask[i]) continue

    const darkness = 1 - (sourcePixels[i] / 255)
    const edge = edges[i] || 0
    const combined = (clampedEdgeWeight * edge) + ((1 - clampedEdgeWeight) * darkness)
    importance[i] = clamp(0.15 + (combined * 0.85), 0, 1)
  }

  return importance
}

function findStartingPin(sourcePixels, mask, pins) {
  let xVector = 0
  let yVector = 0
  const imageSize = Math.sqrt(sourcePixels.length)
  const center = imageSize / 2
  const radius = imageSize / 2 - 2

  for (let y = 0; y < imageSize; y++) {
    for (let x = 0; x < imageSize; x++) {
      const idx = y * imageSize + x
      if (!mask[idx]) continue

      const darkness = 1 - (sourcePixels[idx] / 255)
      if (darkness <= 0.025) continue

      const dx = x - center
      const dy = y - center
      const distance = Math.sqrt((dx * dx) + (dy * dy)) / radius
      const angle = Math.atan2(dy, dx)
      const radialWeight = 0.35 + (0.65 * clamp(distance, 0, 1))
      const weight = darkness * darkness * radialWeight

      xVector += Math.cos(angle) * weight
      yVector += Math.sin(angle) * weight
    }
  }

  if (xVector === 0 && yVector === 0) {
    return 0
  }

  const angle = (Math.atan2(yVector, xVector) + (2 * Math.PI)) % (2 * Math.PI)
  return Math.round((angle / (2 * Math.PI)) * pins) % pins
}

function calculateLineScore(errorArray, importanceMap, lineData, imageSize) {
  let weightedError = 0

  for (const pixel of lineData.pixels) {
    if (pixel.x < 0 || pixel.x >= imageSize || pixel.y < 0 || pixel.y >= imageSize) continue

    const idx = (pixel.y * imageSize) + pixel.x
    const alpha = pixel.alpha || 1
    const residual = errorArray[idx] * alpha

    if (residual <= 0) continue
    weightedError += residual * (0.25 + (importanceMap[idx] * 0.75))
  }

  if (weightedError <= 0) return 0

  return weightedError / Math.pow(lineData.length, 0.28)
}

function updateErrorArray(errorArray, importanceMap, lineData, lineWeight, imageSize) {
  for (const pixel of lineData.pixels) {
    if (pixel.x < 0 || pixel.x >= imageSize || pixel.y < 0 || pixel.y >= imageSize) continue

    const idx = (pixel.y * imageSize) + pixel.x
    const alpha = pixel.alpha || 1
    const localWeight = lineWeight * (0.8 + (importanceMap[idx] * 0.35))
    errorArray[idx] = Math.max(0, errorArray[idx] - (localWeight * alpha))
  }
}

function calculateAdaptiveLineWeight(baseWeight, iteration, maxLines) {
  const progress = maxLines <= 1 ? 0 : iteration / maxLines
  return baseWeight * (1 - (progress * 0.22))
}

function evaluateCandidate({
  currentPin,
  testPin,
  pins,
  lineCache,
  errorArray,
  importanceMap,
  recentPins,
  usedLines,
  pinUsage,
  imageSize,
  useLookahead,
  lookaheadDepth,
  lineWeight,
  minDistance
}) {
  if (testPin === currentPin) return 0
  if (recentPins.includes(testPin)) return 0
  if (circularPinDistance(currentPin, testPin, pins) < minDistance) return 0

  const lineData = lineCache[(currentPin * pins) + testPin]
  if (!lineData) return 0

  let score = calculateLineScore(errorArray, importanceMap, lineData, imageSize)
  if (score <= 0) return 0

  const distanceFactor = circularPinDistance(currentPin, testPin, pins) / (pins / 2)
  const reusePenalty = usedLines.has(lineData.pairKey) ? 0.25 : 1
  const pinPenalty = 1 / (1 + ((pinUsage[testPin] || 0) * 0.08))

  score *= (0.9 + (distanceFactor * 0.2))
  score *= reusePenalty
  score *= pinPenalty

  if (!useLookahead || lookaheadDepth <= 0) {
    return score
  }

  const futureOffsets = [
    minDistance,
    Math.floor(pins / 5),
    Math.floor(pins / 3),
    Math.floor(pins / 2)
  ]
  let bestFutureScore = 0

  for (const offset of futureOffsets) {
    const futurePin = (testPin + offset) % pins
    if (futurePin === currentPin || recentPins.includes(futurePin)) continue
    if (circularPinDistance(testPin, futurePin, pins) < minDistance) continue

    const futureLine = lineCache[(testPin * pins) + futurePin]
    if (!futureLine) continue

    let futureScore = 0
    for (const pixel of futureLine.pixels) {
      if (pixel.x < 0 || pixel.x >= imageSize || pixel.y < 0 || pixel.y >= imageSize) continue
      const idx = (pixel.y * imageSize) + pixel.x
      const alpha = pixel.alpha || 1
      const reducedResidual = Math.max(0, errorArray[idx] - (lineWeight * alpha))
      futureScore += reducedResidual * (0.25 + (importanceMap[idx] * 0.75))
    }

    futureScore /= Math.pow(futureLine.length, 0.28)
    if (futureScore > bestFutureScore) {
      bestFutureScore = futureScore
    }
  }

  return score + (bestFutureScore * 0.12)
}

export function buildManualInstructions(lineSequence, startPin = 0) {
  const instructions = []
  let currentPin = startPin

  for (let i = 0; i < lineSequence.length; i++) {
    const nextPin = lineSequence[i]
    instructions.push({ lineIndex: i, fromPin: currentPin, toPin: nextPin })
    currentPin = nextPin
  }

  return instructions
}

export function buildPreviewSteps(lineSequence, maxPreviewSteps = DEFAULT_PREVIEW_STEPS, startPin = 0) {
  if (!lineSequence.length) return []

  const steps = []
  const stride = Math.max(1, Math.ceil(lineSequence.length / maxPreviewSteps))
  let currentPin = startPin

  for (let i = 0; i < lineSequence.length; i++) {
    const nextPin = lineSequence[i]
    const isBoundary = (i % stride) === 0
    const isLast = i === lineSequence.length - 1

    if (isBoundary || isLast) {
      steps.push({
        lineCount: i + 1,
        lineSequence: lineSequence.slice(0, i + 1),
        fromPin: currentPin,
        toPin: nextPin
      })
    }

    currentPin = nextPin
  }

  return steps
}

function buildRenderingHints(parameters, totalLines) {
  const lineOpacity = clamp(0.09 + ((parameters.lineWeight || 12) / 220), 0.12, 0.22)
  const lineWidth = clamp((parameters.imageSize / 900) * 1.0, 0.65, 1.1)
  const pinRadius = clamp(parameters.imageSize / 360, 1.2, 2)

  return {
    lineOpacity,
    lineWidth,
    pinRadius,
    totalLines
  }
}

function prepareParameters(parameters, defaults = {}) {
  return {
    pins: parameters.pins,
    minDistance: parameters.minDistance,
    maxLines: parameters.maxLines,
    lineWeight: parameters.lineWeight,
    imageSize: parameters.imageSize,
    useEdgeDetection: parameters.useEdgeDetection ?? defaults.useEdgeDetection ?? true,
    useLookahead: parameters.useLookahead ?? defaults.useLookahead ?? false,
    useAntialiasing: parameters.useAntialiasing ?? defaults.useAntialiasing ?? false,
    edgeWeight: parameters.edgeWeight ?? defaults.edgeWeight ?? 0.65,
    lookaheadDepth: parameters.lookaheadDepth ?? defaults.lookaheadDepth ?? 1,
    maxPreviewSteps: parameters.maxPreviewSteps ?? defaults.maxPreviewSteps ?? DEFAULT_PREVIEW_STEPS
  }
}

export async function generateStringArtFromImageData(imageData, rawParameters, onProgress, defaults = {}, onLiveUpdate = null) {
  const parameters = prepareParameters(rawParameters, defaults)
  const {
    pins,
    minDistance,
    maxLines,
    lineWeight: baseLineWeight,
    imageSize,
    useEdgeDetection,
    useLookahead,
    useAntialiasing,
    edgeWeight,
    lookaheadDepth,
    maxPreviewSteps
  } = parameters

  onProgress?.(5)

  const grayscalePixels = imageToGrayscale(imageData, imageSize)
  const { pixels: sourcePixels, mask } = normalizeInsideCircle(grayscalePixels, imageSize)

  onProgress?.(12)

  const edges = useEdgeDetection
    ? detectEdges(sourcePixels, mask, imageSize)
    : new Float32Array(imageSize * imageSize)

  onProgress?.(20)

  const importanceMap = createImportanceMap(sourcePixels, mask, edges, imageSize, edgeWeight)
  const errorArray = new Float32Array(imageSize * imageSize)

  for (let i = 0; i < errorArray.length; i++) {
    errorArray[i] = mask[i] ? (255 - sourcePixels[i]) : 0
  }

  const pinCoords = calculatePinCoords(pins, imageSize)

  onProgress?.(28)

  const lineCache = buildLineCache(pinCoords, pins, minDistance, useAntialiasing)
  const lineSequence = []
  const usedLines = new Set()
  const pinUsage = new Uint16Array(pins)
  const recentPins = new Array(Math.min(24, Math.max(8, Math.floor(pins / 14)))).fill(-1)
  const startPin = findStartingPin(sourcePixels, mask, pins)
  let currentPin = startPin

  onProgress?.(35)

  for (let i = 0; i < maxLines; i++) {
    let bestPin = -1
    let bestScore = 0
    const adaptiveLineWeight = calculateAdaptiveLineWeight(baseLineWeight, i, maxLines)

    for (let testPin = 0; testPin < pins; testPin++) {
      const score = evaluateCandidate({
        currentPin,
        testPin,
        pins,
        lineCache,
        errorArray,
        importanceMap,
        recentPins,
        usedLines,
        pinUsage,
        imageSize,
        useLookahead,
        lookaheadDepth,
        lineWeight: adaptiveLineWeight,
        minDistance
      })

      if (score > bestScore) {
        bestScore = score
        bestPin = testPin
      }
    }

    if (bestPin === -1 || bestScore <= 0) break

    const lineData = lineCache[(currentPin * pins) + bestPin]
    if (!lineData) break

    lineSequence.push(bestPin)
    usedLines.add(lineData.pairKey)
    pinUsage[currentPin] += 1
    pinUsage[bestPin] += 1
    updateErrorArray(errorArray, importanceMap, lineData, adaptiveLineWeight, imageSize)

    recentPins.shift()
    recentPins.push(bestPin)
    currentPin = bestPin

    if (i % 50 === 0) {
      onProgress?.(35 + Math.floor((i / Math.max(1, maxLines)) * 60))
      if (i % 200 === 0 && i > 0 && onLiveUpdate) {
        onLiveUpdate({
          lineSequence: lineSequence.slice(),
          pinCoords,
          startPin,
          rendering: buildRenderingHints(parameters, i)
        })
      }
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }

  onProgress?.(97)

  const steps = buildPreviewSteps(lineSequence, maxPreviewSteps, startPin)
  const manualInstructions = buildManualInstructions(lineSequence, startPin)
  const rendering = buildRenderingHints(parameters, lineSequence.length)

  onProgress?.(100)

  return {
    lineSequence,
    pinCoords,
    startPin,
    steps,
    manualInstructions,
    parameters,
    rendering,
    stats: {
      totalLines: lineSequence.length,
      previewSteps: steps.length,
      generatedAt: new Date().toISOString()
    }
  }
}
