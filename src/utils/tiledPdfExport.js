const PAGE_FORMATS_MM = {
  portrait: { width: 210, height: 297, label: 'A4 Portrait' },
  landscape: { width: 297, height: 210, label: 'A4 Landscape' }
}

const EXPORT_DPI = 240

function mmToPx(mm) {
  return Math.round((mm / 25.4) * EXPORT_DPI)
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

      pageCtx.strokeStyle = '#7c8796'
      pageCtx.lineWidth = 2
      pageCtx.setLineDash([8, 6])
      pageCtx.strokeRect(marginPxX, marginPxY, tilePixelWidth, tilePixelHeight)
      pageCtx.setLineDash([])

      pageCtx.fillStyle = '#334155'
      pageCtx.font = '24px Arial'
      pageCtx.fillText(
        `Sheet ${row + 1}-${col + 1} • ${Math.round(tiling.tileWidthMm)} x ${Math.round(tiling.tileHeightMm)} mm`,
        marginPxX,
        pageCanvas.height - 28
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
