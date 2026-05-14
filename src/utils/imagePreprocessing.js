const GAUSS_3x3 = [1, 2, 1, 2, 4, 2, 1, 2, 1]

export function gaussianBlurGrayscale(pixels, size) {
  const output = new Float32Array(pixels.length)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0
      let totalWeight = 0

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const ny = y + ky
          const nx = x + kx
          if (ny < 0 || ny >= size || nx < 0 || nx >= size) continue

          const w = GAUSS_3x3[(ky + 1) * 3 + (kx + 1)]
          sum += pixels[ny * size + nx] * w
          totalWeight += w
        }
      }

      output[y * size + x] = totalWeight > 0 ? sum / totalWeight : pixels[y * size + x]
    }
  }

  return output
}

export function unsharpMask(pixels, size, amount = 0.55) {
  const blurred = gaussianBlurGrayscale(pixels, size)
  const output = new Float32Array(pixels.length)

  for (let i = 0; i < pixels.length; i++) {
    const sharpened = pixels[i] + amount * (pixels[i] - blurred[i])
    output[i] = Math.max(0, Math.min(255, sharpened))
  }

  return output
}

export function percentileStretch(pixels, mask, low = 0.015, high = 0.985) {
  const values = []

  for (let i = 0; i < pixels.length; i++) {
    if (mask && !mask[i]) continue
    values.push(pixels[i])
  }

  if (values.length < 10) return pixels

  values.sort((a, b) => a - b)

  const lowVal = values[Math.floor(values.length * low)]
  const highVal = values[Math.floor(values.length * high)]
  const range = Math.max(1, highVal - lowVal)

  const output = new Float32Array(pixels.length)

  for (let i = 0; i < pixels.length; i++) {
    if (mask && !mask[i]) {
      output[i] = pixels[i]
      continue
    }
    output[i] = Math.max(0, Math.min(255, ((pixels[i] - lowVal) / range) * 255))
  }

  return output
}
