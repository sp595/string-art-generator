const PAGE_FORMATS_MM = {
  portrait: { width: 210, height: 297, label: 'A4 Portrait' },
  landscape: { width: 297, height: 210, label: 'A4 Landscape' }
}

const EXPORT_DPI = 240

function mmToPx(mm) {
  return Math.round((mm / 25.4) * EXPORT_DPI)
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let curY = y
  for (const word of words) {
    const test = line + word + ' '
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      ctx.fillText(line.trimEnd(), x, curY)
      line = word + ' '
      curY += lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line.trimEnd(), x, curY)
  return curY + lineHeight
}

function drawRegistrationMark(ctx, x, y, size) {
  const w = Math.max(0.5, size * 0.06)
  ctx.save()
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = w
  ctx.beginPath(); ctx.moveTo(x - size, y); ctx.lineTo(x + size, y); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x, y + size); ctx.stroke()
  ctx.restore()
}

function createAssemblyInstructionsCanvas(widthMm, heightMm) {
  const wPx = mmToPx(widthMm)
  const hPx = mmToPx(heightMm)
  const canvas = document.createElement('canvas')
  canvas.width = wPx
  canvas.height = hPx
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, wPx, hPx)

  const mg = mmToPx(18)
  const cw = wPx - 2 * mg
  const fs = mmToPx(3.8)
  const lh = fs * 1.55

  let y = mg

  ctx.fillStyle = '#111827'
  ctx.font = `bold ${mmToPx(6.5)}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('String Art — Istruzioni di costruzione', wPx / 2, y)
  y += mmToPx(11)

  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = mmToPx(0.3)
  ctx.beginPath(); ctx.moveTo(mg, y); ctx.lineTo(wPx - mg, y); ctx.stroke()
  y += mmToPx(7)

  ctx.textAlign = 'left'

  const drawSection = (title, lines) => {
    ctx.fillStyle = '#1f2937'
    ctx.font = `bold ${mmToPx(4.2)}px Arial, sans-serif`
    ctx.fillText(title, mg, y)
    y += mmToPx(6.5)
    ctx.fillStyle = '#374151'
    ctx.font = `${fs}px Arial, sans-serif`
    for (const line of lines) {
      y = wrapText(ctx, line, mg + mmToPx(3), y, cw - mmToPx(3), lh)
      y += mmToPx(1)
    }
    y += mmToPx(5)
  }

  drawSection('Assemblaggio fogli PDF:', [
    '1. Stampa tutti i fogli in scala 1:1 (senza ridimensionamento della stampante).',
    '2. Ritaglia seguendo il cerchio tratteggiato esterno (guida di taglio).',
    '3. Allinea i fogli adiacenti usando i segni + agli angoli di ogni foglio.',
    '4. Sovrapponi di circa 5 mm sui bordi e incolla o fissa con nastro adesivo sul retro.',
  ])

  drawSection('Inserimento chiodi:', [
    '• Usa chiodi da 13 mm con testa piccola su MDF di almeno 4 mm di spessore.',
    '• Segui la numerazione dello stencil per posizionare ogni chiodo in ordine.',
    '• Lascia sporgere 5–8 mm sopra la superficie del pannello per ogni chiodo.',
  ])

  drawSection('Avvolgimento del filo:', [
    '• Inizia dal pin 0: fissa il capo del filo con 3–4 giri attorno al primo chiodo.',
    '• ★ Avvolgi SEMPRE nella stessa direzione per tutta la string art (oraria o antioraria — scegli e mantienila).',
    '• ★ Attorno a OGNI chiodo intermedio gira almeno 2 volte prima di passare al successivo: evita che il filo si allenti nel tempo.',
    '• Mantieni la tensione del filo costante: né troppo teso né troppo lasco.',
    '• Al termine: avvolgi 3–4 giri sull\'ultimo pin, annoda e taglia.',
  ])

  drawSection('Sequenza linee (nell\'app):', [
    '• Apri l\'app e vai alla modalità "Manuale" con il pulsante in basso al canvas.',
    '• I tasti ← → (o i pulsanti freccia) avanzano di una linea alla volta.',
    '• Il numero DA → A indica i due pin tra cui tendere il filo.',
    '• La posizione viene salvata automaticamente; ricarica la pagina per riprendere.',
  ])

  ctx.fillStyle = '#9ca3af'
  ctx.font = `${mmToPx(2.8)}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText('Generato con String Art Generator', wPx / 2, hPx - mg / 2)

  return canvas
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
  const total = pinCoords.length

  // Geometry: define zones from canvas edge inward
  // [canvas edge] — outerPad — [cutting guide] — labelZone — [pin circle] — center
  const fontSize = Math.max(5, Math.round(sizePx * 0.006))
  const outerPad = Math.max(10, sizePx * 0.007)         // canvas edge → cutting guide
  const labelZone = Math.max(fontSize * 3.2, sizePx * 0.022)  // cutting guide → pin circle
  const radius = Math.max(10, center - outerPad - labelZone)   // pin circle radius
  const cuttingR = center - outerPad                            // cutting guide radius

  const pinRadius = Math.max(1.2, sizePx * 0.0015)
  const circleLineW = Math.max(2, sizePx * 0.002)

  // Pin circle
  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = circleLineW
  ctx.beginPath()
  ctx.arc(center, center, radius, 0, Math.PI * 2)
  ctx.stroke()

  // Cutting guide circle (dashed), clearly outside label zone
  ctx.strokeStyle = '#9ca3af'
  ctx.lineWidth = Math.max(1, sizePx * 0.001)
  ctx.setLineDash([Math.max(8, sizePx * 0.009), Math.max(4, sizePx * 0.0045)])
  ctx.beginPath()
  ctx.arc(center, center, cuttingR, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.font = `600 ${fontSize}px "Arial", sans-serif`

  pinCoords.forEach((_, index) => {
    // Use exact angular position to avoid Math.floor() drift in stored pinCoords
    const angle = (2 * Math.PI * index) / total
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    // Pin dot exactly on the circle
    const x = center + radius * cos
    const y = center + radius * sin

    // Guide tick from pin outward
    const lineEndDist = radius + (labelZone * 0.25)
    ctx.strokeStyle = '#d4d4d8'
    ctx.lineWidth = Math.max(0.6, sizePx * 0.0007)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(center + lineEndDist * cos, center + lineEndDist * sin)
    ctx.stroke()

    // Pin dot (drawn after tick so it covers the line start)
    ctx.fillStyle = '#111827'
    ctx.beginPath()
    ctx.arc(x, y, pinRadius, 0, Math.PI * 2)
    ctx.fill()

    // Radially oriented label midway through the label zone
    const labelDist = radius + labelZone * 0.55
    const labelX = center + labelDist * cos
    const labelY = center + labelDist * sin

    const isLeftHalf = Math.abs(angle) > Math.PI / 2
    const textAngle = isLeftHalf ? angle + Math.PI : angle
    ctx.save()
    ctx.translate(labelX, labelY)
    ctx.rotate(textAngle)
    ctx.fillStyle = '#111827'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(index), 0, 0)
    ctx.restore()
  })

  return canvas
}

export function getA4TilingConfig(physicalSizeCm, orientation = 'portrait', marginMm = 5) {
  const format = PAGE_FORMATS_MM[orientation] || PAGE_FORMATS_MM.portrait
  const sizeMm = Math.max(10, Number(physicalSizeCm) || 0) * 10
  const safeMarginMm = Math.max(0, Math.min(20, Number(marginMm) || 0))
  const usableWidthMm = Math.max(10, format.width - safeMarginMm * 2)
  const usableHeightMm = Math.max(10, format.height - safeMarginMm * 2)
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
  const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true })

  const pageW = mmToPx(tiling.width)
  const pageH = mmToPx(tiling.height)
  const mg = mmToPx(tiling.marginMm)
  const tileW = mmToPx(tiling.tileWidthMm)
  const tileH = mmToPx(tiling.tileHeightMm)
  const markSize = mmToPx(4)

  let pageIndex = 0

  for (let row = 0; row < tiling.rows; row++) {
    for (let col = 0; col < tiling.columns; col++) {
      if (pageIndex > 0) pdf.addPage('a4', orientation)

      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = pageW
      pageCanvas.height = pageH
      const pCtx = pageCanvas.getContext('2d')
      pCtx.imageSmoothingEnabled = true
      pCtx.imageSmoothingQuality = 'high'
      pCtx.fillStyle = '#ffffff'
      pCtx.fillRect(0, 0, pageW, pageH)

      const srcX = Math.round((col / tiling.columns) * renderCanvas.width)
      const srcY = Math.round((row / tiling.rows) * renderCanvas.height)
      const srcW = Math.round(renderCanvas.width / tiling.columns)
      const srcH = Math.round(renderCanvas.height / tiling.rows)

      pCtx.drawImage(renderCanvas, srcX, srcY, srcW, srcH, mg, mg, tileW, tileH)

      // Registration marks at tile corners
      for (const [cx, cy] of [[mg, mg], [mg + tileW, mg], [mg, mg + tileH], [mg + tileW, mg + tileH]]) {
        drawRegistrationMark(pCtx, cx, cy, markSize)
      }

      // Page label
      pCtx.fillStyle = '#9ca3af'
      pCtx.font = `${mmToPx(2.4)}px Arial, sans-serif`
      pCtx.textAlign = 'right'
      pCtx.textBaseline = 'bottom'
      pCtx.fillText(
        `Foglio ${pageIndex + 1}/${tiling.totalPages} — Col ${col + 1}/${tiling.columns}, Riga ${row + 1}/${tiling.rows}`,
        pageW - mg / 2,
        pageH - mg / 2
      )

      pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, tiling.width, tiling.height, undefined, 'FAST')
      pageIndex++
    }
  }

  // Assembly instructions page (always last)
  pdf.addPage('a4', orientation)
  const instrCanvas = createAssemblyInstructionsCanvas(tiling.width, tiling.height)
  pdf.addImage(instrCanvas.toDataURL('image/png'), 'PNG', 0, 0, tiling.width, tiling.height, undefined, 'FAST')

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
  const renderCanvas = drawPinStencilCanvas({ pinCoords, physicalSizeCm, imageSize })
  return exportTiledCanvasToPdf(renderCanvas, { physicalSizeCm, orientation, marginMm, fileName })
}
