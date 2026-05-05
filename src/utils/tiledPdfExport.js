const PAGE_FORMATS_MM = {
  portrait: { width: 210, height: 297, label: 'A4 Portrait' },
  landscape: { width: 297, height: 210, label: 'A4 Landscape' }
}

const EXPORT_DPI = 240

function mmToPx(mm) {
  return Math.round((mm / 25.4) * EXPORT_DPI)
}

function drawPinStencilCanvas({ pinCoords, physicalSizeCm, imageSize }) {
  const sizeMm = Math.max(10, Number(physicalSizeCm) || 0) * 10
  const sizePx = mmToPx(sizeMm)
  const canvas = document.createElement('canvas')
  canvas.width = sizePx
  canvas.height = sizePx

  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, sizePx, sizePx)

  const center = sizePx / 2
  const originalCenter = imageSize / 2
  const originalRadius = Math.max(...pinCoords.map((pin) => {
    const dx = pin.x - originalCenter
    const dy = pin.y - originalCenter
    return Math.sqrt((dx * dx) + (dy * dy))
  }))

  const pinRadius = Math.max(0.8, sizePx * 0.0012)
  const labelDistance = Math.max(2, sizePx * 0.0048)
  const fontSize = Math.max(3, Math.round(sizePx * 0.004))
  const labelInset = Math.max(0.4, sizePx * 0.0007)
  const labelPadding = Math.max(fontSize * 1.7, 8)
  const radius = Math.max(10, center - labelDistance - labelPadding)
  const scale = radius / originalRadius

  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = Math.max(2, sizePx * 0.0022)
  ctx.beginPath()
  ctx.arc(center, center, radius, 0, Math.PI * 2)
  ctx.stroke()

  ctx.font = `600 ${fontSize}px "Arial", sans-serif`

  pinCoords.forEach((pin, index) => {
    const x = center + ((pin.x - originalCenter) * scale)
    const y = center + ((pin.y - originalCenter) * scale)
    const angle = Math.atan2(y - center, x - center)
    const horizontal = Math.cos(angle)
    const vertical = Math.sin(angle)
    const sideDistanceBoost = Math.abs(horizontal) > 0.82 ? Math.max(2, sizePx * 0.0028) : 0
    const effectiveLabelDistance = labelDistance + sideDistanceBoost
    const labelX = center + ((radius + effectiveLabelDistance) * horizontal)
    const labelY = center + ((radius + effectiveLabelDistance) * vertical)
    const lineEndX = center + ((radius + (effectiveLabelDistance * 0.38)) * horizontal)
    const lineEndY = center + ((radius + (effectiveLabelDistance * 0.38)) * vertical)

    ctx.fillStyle = '#111827'
    ctx.beginPath()
    ctx.arc(x, y, pinRadius, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#d4d4d8'
    ctx.lineWidth = Math.max(0.6, sizePx * 0.0007)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(lineEndX, lineEndY)
    ctx.stroke()

    if (horizontal > 0.28) {
      ctx.textAlign = 'right'
    } else if (horizontal < -0.28) {
      ctx.textAlign = 'left'
    } else {
      ctx.textAlign = 'center'
    }

    if (vertical > 0.35) {
      ctx.textBaseline = 'middle'
    } else if (vertical < -0.35) {
      ctx.textBaseline = 'middle'
    } else {
      ctx.textBaseline = 'middle'
    }

    const textX = horizontal > 0.28
      ? labelX - labelInset
      : horizontal < -0.28
        ? labelX + labelInset
        : labelX

    const textY = labelY + (vertical * Math.max(0.15, sizePx * 0.00025))

    ctx.fillStyle = '#111827'
    ctx.fillText(String(index), textX, textY)
  })

  return canvas
}

export function getA4TilingConfig(physicalSizeCm, orientation = 'portrait', marginMm = 5) {
  const format = PAGE_FORMATS_MM[orientation] || PAGE_FORMATS_MM.portrait
  const sizeMm = Math.max(10, Number(physicalSizeCm) || 0) * 10
  const safeMarginMm = Math.max(0, Math.min(20, Number(marginMm) || 0))
  const usableWidthMm = Math.max(10, format.width - (safeMarginMm * 2))
  const usableHeightMm = Math.max(10, format.height - (safeMarginMm * 2))
  const columns = Math.max(1, Math.ceil(sizeMm / usableWidthMm))
  const rows = Math.max(1, Math.ceil(sizeMm / usableHeightMm))

  return {
    ...format,
    sizeMm,
    marginMm: safeMarginMm,
    usableWidthMm,
    usableHeightMm,
    columns,
    rows,
    totalPages: columns * rows,
    tileWidthMm: sizeMm / columns,
    tileHeightMm: sizeMm / rows
  }
}

export async function exportTiledCanvasToPdf(renderCanvas, {
  physicalSizeCm,
  orientation = 'portrait',
  marginMm = 5,
  fileName = `string-art-a4-${Date.now()}.pdf`
}) {
  const { jsPDF } = await import('jspdf')
  const tiling = getA4TilingConfig(physicalSizeCm, orientation, marginMm)
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true
  })

  const pagePixelWidth = mmToPx(tiling.width)
  const pagePixelHeight = mmToPx(tiling.height)
  const marginPxX = mmToPx(tiling.marginMm)
  const marginPxY = mmToPx(tiling.marginMm)
  const tilePixelWidth = mmToPx(tiling.tileWidthMm)
  const tilePixelHeight = mmToPx(tiling.tileHeightMm)

  let pageIndex = 0

  for (let row = 0; row < tiling.rows; row++) {
    for (let col = 0; col < tiling.columns; col++) {
      if (pageIndex > 0) {
        pdf.addPage('a4', orientation)
      }

      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = pagePixelWidth
      pageCanvas.height = pagePixelHeight

      const pageCtx = pageCanvas.getContext('2d')
      pageCtx.imageSmoothingEnabled = true
      pageCtx.imageSmoothingQuality = 'high'
      pageCtx.fillStyle = '#ffffff'
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)

      const sourceX = Math.round((col / tiling.columns) * renderCanvas.width)
      const sourceY = Math.round((row / tiling.rows) * renderCanvas.height)
      const sourceWidth = Math.round(renderCanvas.width / tiling.columns)
      const sourceHeight = Math.round(renderCanvas.height / tiling.rows)

      pageCtx.drawImage(
        renderCanvas,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        marginPxX,
        marginPxY,
        tilePixelWidth,
        tilePixelHeight
      )

      pdf.addImage(
        pageCanvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        tiling.width,
        tiling.height,
        undefined,
        'FAST'
      )

      pageIndex += 1
    }
  }

  pdf.save(fileName)
  return tiling
}

export async function exportPinStencilToPdf({
  pinCoords,
  imageSize,
  physicalSizeCm,
  orientation = 'portrait',
  marginMm = 5,
  fileName = `string-art-pin-stencil-${Date.now()}.pdf`
}) {
  const renderCanvas = drawPinStencilCanvas({
    pinCoords,
    physicalSizeCm,
    imageSize
  })

  return exportTiledCanvasToPdf(renderCanvas, {
    physicalSizeCm,
    orientation,
    marginMm,
    fileName
  })
}
