const TAU = Math.PI * 2

function clampNumber(value, fallback, min, max) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(max, Math.max(min, numeric))
}

function getJigGeometry({
  circleRadiusMm = 300,
  pinCount = 160,
  holeCount = 6,
  nailDiameterMm = 1.8,
  clearanceMm = 0.3,
  jigHeightMm = 6
} = {}) {
  const radius = Math.max(50, Number(circleRadiusMm) || 300)
  const pins = Math.max(16, Math.round(Number(pinCount) || 160))
  const guides = clampNumber(holeCount, 6, 3, 12)
  const nailD = clampNumber(nailDiameterMm, 1.8, 0.8, 5)
  const clearance = clampNumber(clearanceMm, 0.3, 0, 1.2)
  const height = clampNumber(jigHeightMm, 6, 2, 6)
  const angleStep = TAU / pins
  const pinArc = radius * angleStep
  const holeRadius = (nailD + clearance * 2) / 2
  const guideOuterRadius = Math.max(
    holeRadius + 1.15,
    Math.min(holeRadius + 3.1, pinArc - holeRadius - 0.25)
  )
  const anchorOuterRadius = guideOuterRadius + 1.25
  const bridgeWidth = Math.max(2.2, guideOuterRadius * 0.9)
  const guideCenterOffset = (guides - 1) / 2
  const innerFillOffset = guideOuterRadius + Math.max(7, Math.min(18, pinArc * 1.7))
  const bandInnerRadius = Math.max(20, radius - innerFillOffset)
  const bandOuterRadius = radius + anchorOuterRadius
  const bandStartAngle = (-1 - guideCenterOffset) * angleStep - angleStep * 0.5
  const bandEndAngle = (guides - guideCenterOffset) * angleStep + angleStep * 0.5

  const stations = []
  for (let i = -1; i <= guides; i += 1) {
    const angle = (i - guideCenterOffset) * angleStep
    const x = Math.sin(angle) * radius
    const y = radius - Math.cos(angle) * radius
    stations.push({
      index: i,
      isAnchor: i === -1 || i === guides,
      angle,
      x,
      y
    })
  }

  return {
    radius,
    pins,
    guides,
    nailD,
    clearance,
    height,
    angleStep,
    pinArc,
    holeRadius,
    holeDiameter: holeRadius * 2,
    guideOuterRadius,
    anchorOuterRadius,
    bridgeWidth,
    innerFillOffset,
    bandInnerRadius,
    bandOuterRadius,
    bandStartAngle,
    bandEndAngle,
    stations
  }
}

function stlFacet(vertices, desiredNormal = null) {
  let ordered = vertices
  if (desiredNormal) {
    const normal = getNormal(vertices)
    const dot = normal[0] * desiredNormal[0] + normal[1] * desiredNormal[1] + normal[2] * desiredNormal[2]
    if (dot < 0) ordered = [vertices[0], vertices[2], vertices[1]]
  }
  const normal = getNormal(ordered)
  return [
    `  facet normal ${normal[0].toFixed(6)} ${normal[1].toFixed(6)} ${normal[2].toFixed(6)}`,
    '    outer loop',
    ...ordered.map(([x, y, z]) => `      vertex ${x.toFixed(5)} ${y.toFixed(5)} ${z.toFixed(5)}`),
    '    endloop',
    '  endfacet'
  ].join('\n')
}

function getNormal(vertices) {
  const [a, b, c] = vertices
  const ux = b[0] - a[0]
  const uy = b[1] - a[1]
  const uz = b[2] - a[2]
  const vx = c[0] - a[0]
  const vy = c[1] - a[1]
  const vz = c[2] - a[2]
  const nx = uy * vz - uz * vy
  const ny = uz * vx - ux * vz
  const nz = ux * vy - uy * vx
  const length = Math.hypot(nx, ny, nz) || 1
  return [nx / length, ny / length, nz / length]
}

function addQuad(facets, a, b, c, d) {
  facets.push(stlFacet([a, b, c]))
  facets.push(stlFacet([a, c, d]))
}

function polarPoint(center, radius, angle, z) {
  return [
    center.x + Math.cos(angle) * radius,
    center.y + Math.sin(angle) * radius,
    z
  ]
}

function addRing(facets, center, innerRadius, outerRadius, height, {
  segments = 48,
  startAngle = 0,
  endAngle = TAU,
  closeEnds = false
} = {}) {
  const span = endAngle - startAngle
  const steps = Math.max(8, Math.ceil(segments * Math.abs(span) / TAU))

  for (let s = 0; s < steps; s += 1) {
    const a0 = startAngle + (span * s) / steps
    const a1 = startAngle + (span * (s + 1)) / steps
    const ot0 = polarPoint(center, outerRadius, a0, height)
    const ot1 = polarPoint(center, outerRadius, a1, height)
    const ob0 = polarPoint(center, outerRadius, a0, 0)
    const ob1 = polarPoint(center, outerRadius, a1, 0)
    const it0 = polarPoint(center, innerRadius, a0, height)
    const it1 = polarPoint(center, innerRadius, a1, height)
    const ib0 = polarPoint(center, innerRadius, a0, 0)
    const ib1 = polarPoint(center, innerRadius, a1, 0)

    addQuad(facets, ot0, ot1, it1, it0)
    addQuad(facets, ob1, ob0, ib0, ib1)
    addQuad(facets, ob0, ob1, ot1, ot0)
    addQuad(facets, ib1, ib0, it0, it1)
  }

  if (closeEnds && span < TAU - 0.001) {
    for (const angle of [startAngle, endAngle]) {
      const ot = polarPoint(center, outerRadius, angle, height)
      const ob = polarPoint(center, outerRadius, angle, 0)
      const it = polarPoint(center, innerRadius, angle, height)
      const ib = polarPoint(center, innerRadius, angle, 0)
      addQuad(facets, ob, ot, it, ib)
    }
  }
}

function addBridge(facets, a, b, width, height, trim) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy)
  if (length <= trim * 2) return

  const ux = dx / length
  const uy = dy / length
  const px = -uy * width / 2
  const py = ux * width / 2
  const sx = a.x + ux * trim
  const sy = a.y + uy * trim
  const ex = b.x - ux * trim
  const ey = b.y - uy * trim
  const corners = [
    [sx + px, sy + py],
    [ex + px, ey + py],
    [ex - px, ey - py],
    [sx - px, sy - py]
  ]
  const bottom = corners.map(([x, y]) => [x, y, 0])
  const top = corners.map(([x, y]) => [x, y, height])

  addQuad(facets, top[0], top[1], top[2], top[3])
  addQuad(facets, bottom[3], bottom[2], bottom[1], bottom[0])
  for (let i = 0; i < 4; i += 1) {
    const next = (i + 1) % 4
    addQuad(facets, bottom[i], bottom[next], top[next], top[i])
  }
}

function circlePoint(geometry, angle, radius, z) {
  return [
    Math.sin(angle) * radius,
    geometry.radius - Math.cos(angle) * radius,
    z
  ]
}

function jigPoint(geometry, s, offset, z) {
  const angle = s / geometry.radius
  return circlePoint(geometry, angle, geometry.radius + offset, z)
}

function normalFromJigPlane(geometry, s, ns, nv) {
  const angle = s / geometry.radius
  const tangent = [Math.cos(angle), Math.sin(angle), 0]
  const radial = [Math.sin(angle), -Math.cos(angle), 0]
  const nx = tangent[0] * ns + radial[0] * nv
  const ny = tangent[1] * ns + radial[1] * nv
  const length = Math.hypot(nx, ny) || 1
  return [nx / length, ny / length, 0]
}

function isInAnchorOpening(station, x, y, geometry) {
  if (!station.isAnchor) return false
  const dx = x - station.x
  const dy = y - station.y
  const distance = Math.hypot(dx, dy)
  if (distance > geometry.anchorOuterRadius * 1.25) return false

  const outwardX = Math.sin(station.angle)
  const outwardY = -Math.cos(station.angle)
  const projection = dx * outwardX + dy * outwardY
  const side = Math.abs(dx * -outwardY + dy * outwardX)
  return projection > 0 && side < geometry.anchorOuterRadius * 0.95
}

function isBandCellFilled(geometry, angle, radius) {
  const x = Math.sin(angle) * radius
  const y = geometry.radius - Math.cos(angle) * radius

  for (const station of geometry.stations) {
    const distance = Math.hypot(x - station.x, y - station.y)
    if (distance < geometry.holeRadius * 0.96) return false
    if (isInAnchorOpening(station, x, y, geometry)) return false
  }

  return true
}

function triangulate(points) {
  if (points.length < 3) return []

  let minS = Infinity
  let minV = Infinity
  let maxS = -Infinity
  let maxV = -Infinity
  for (const point of points) {
    minS = Math.min(minS, point.s)
    minV = Math.min(minV, point.v)
    maxS = Math.max(maxS, point.s)
    maxV = Math.max(maxV, point.v)
  }

  const span = Math.max(maxS - minS, maxV - minV) || 1
  const centerS = (minS + maxS) / 2
  const centerV = (minV + maxV) / 2
  const baseLength = points.length
  const allPoints = [
    ...points,
    { s: centerS - span * 20, v: centerV - span * 20 },
    { s: centerS, v: centerV + span * 24 },
    { s: centerS + span * 20, v: centerV - span * 20 }
  ]
  const superTriangle = [baseLength, baseLength + 1, baseLength + 2]
  let triangles = [superTriangle]

  const circumcircleContains = (triangle, point) => {
    const a = allPoints[triangle[0]]
    const b = allPoints[triangle[1]]
    const c = allPoints[triangle[2]]
    const d = 2 * (a.s * (b.v - c.v) + b.s * (c.v - a.v) + c.s * (a.v - b.v))
    if (Math.abs(d) < 1e-9) return false
    const ux = ((a.s * a.s + a.v * a.v) * (b.v - c.v) +
      (b.s * b.s + b.v * b.v) * (c.v - a.v) +
      (c.s * c.s + c.v * c.v) * (a.v - b.v)) / d
    const uy = ((a.s * a.s + a.v * a.v) * (c.s - b.s) +
      (b.s * b.s + b.v * b.v) * (a.s - c.s) +
      (c.s * c.s + c.v * c.v) * (b.s - a.s)) / d
    const radiusSquared = (ux - a.s) ** 2 + (uy - a.v) ** 2
    const distanceSquared = (ux - point.s) ** 2 + (uy - point.v) ** 2
    return distanceSquared <= radiusSquared + 1e-8
  }

  const edgeKey = (a, b) => a < b ? `${a}:${b}` : `${b}:${a}`

  for (let pointIndex = 0; pointIndex < baseLength; pointIndex += 1) {
    const polygon = new Map()
    const nextTriangles = []

    for (const triangle of triangles) {
      if (circumcircleContains(triangle, allPoints[pointIndex])) {
        for (const [a, b] of [[triangle[0], triangle[1]], [triangle[1], triangle[2]], [triangle[2], triangle[0]]]) {
          const key = edgeKey(a, b)
          if (polygon.has(key)) polygon.delete(key)
          else polygon.set(key, [a, b])
        }
      } else {
        nextTriangles.push(triangle)
      }
    }

    for (const edge of polygon.values()) {
      nextTriangles.push([edge[0], edge[1], pointIndex])
    }

    triangles = nextTriangles
  }

  return triangles.filter(triangle => triangle.every(index => index < baseLength))
}

function addFilledInnerBand(facets, geometry) {
  const sMin = geometry.bandStartAngle * geometry.radius
  const sMax = geometry.bandEndAngle * geometry.radius
  const vMin = geometry.bandInnerRadius - geometry.radius
  const vMax = geometry.bandOuterRadius - geometry.radius
  const holes = geometry.stations.map(station => ({
    s: station.angle * geometry.radius,
    v: 0,
    r: geometry.holeRadius,
    isAnchor: station.isAnchor
  }))
  const sBreaks = new Set([sMin, sMax])
  const circleSegments = 40

  for (const hole of holes) {
    for (let i = 0; i <= circleSegments; i += 1) {
      const angle = Math.PI * i / circleSegments
      const s = hole.s + Math.cos(angle) * hole.r
      if (s > sMin && s < sMax) sBreaks.add(Number(s.toFixed(5)))
    }
    if (hole.isAnchor) {
      sBreaks.add(Number(Math.max(sMin, hole.s - hole.r).toFixed(5)))
      sBreaks.add(Number(Math.min(sMax, hole.s + hole.r).toFixed(5)))
    }
  }

  const sortedS = [...sBreaks].sort((a, b) => a - b)
  const rects = []

  const subtractInterval = (intervals, cutStart, cutEnd) => {
    const next = []
    for (const [start, end] of intervals) {
      if (cutEnd <= start || cutStart >= end) {
        next.push([start, end])
      } else {
        if (cutStart > start) next.push([start, Math.max(start, cutStart)])
        if (cutEnd < end) next.push([Math.min(end, cutEnd), end])
      }
    }
    return next.filter(([start, end]) => end - start > 0.02)
  }

  for (let i = 0; i < sortedS.length - 1; i += 1) {
    const s0 = sortedS[i]
    const s1 = sortedS[i + 1]
    if (s1 - s0 < 0.001) continue
    const sm = (s0 + s1) / 2
    let intervals = [[vMin, vMax]]

    for (const hole of holes) {
      const dx = sm - hole.s
      if (Math.abs(dx) >= hole.r) continue
      const half = Math.sqrt(hole.r * hole.r - dx * dx)
      const cutEnd = hole.isAnchor ? vMax : half
      intervals = subtractInterval(intervals, -half, cutEnd)
    }

    for (const [a, b] of intervals) {
      rects.push({ s0, s1, v0: a, v1: b })
    }
  }

  const edgeMap = new Map()
  const edgeKey = (a, b) => {
    const ka = `${a.s.toFixed(5)}:${a.v.toFixed(5)}`
    const kb = `${b.s.toFixed(5)}:${b.v.toFixed(5)}`
    return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`
  }
  const addBoundaryEdge = (a, b, normal2d) => {
    const key = edgeKey(a, b)
    if (edgeMap.has(key)) edgeMap.delete(key)
    else edgeMap.set(key, { a, b, normal2d })
  }

  for (const rect of rects) {
    const p00 = { s: rect.s0, v: rect.v0 }
    const p10 = { s: rect.s1, v: rect.v0 }
    const p11 = { s: rect.s1, v: rect.v1 }
    const p01 = { s: rect.s0, v: rect.v1 }

    const top = [p00, p10, p11, p01].map(p => jigPoint(geometry, p.s, p.v, geometry.height))
    const bottom = [p00, p10, p11, p01].map(p => jigPoint(geometry, p.s, p.v, 0))
    facets.push(stlFacet([top[0], top[1], top[2]], [0, 0, 1]))
    facets.push(stlFacet([top[0], top[2], top[3]], [0, 0, 1]))
    facets.push(stlFacet([bottom[0], bottom[2], bottom[1]], [0, 0, -1]))
    facets.push(stlFacet([bottom[0], bottom[3], bottom[2]], [0, 0, -1]))

    addBoundaryEdge(p00, p10, [0, -1])
    addBoundaryEdge(p10, p11, [1, 0])
    addBoundaryEdge(p11, p01, [0, 1])
    addBoundaryEdge(p01, p00, [-1, 0])
  }

  for (const { a, b, normal2d } of edgeMap.values()) {
    const desiredNormal = normalFromJigPlane(geometry, (a.s + b.s) / 2, normal2d[0], normal2d[1])
    const a0 = jigPoint(geometry, a.s, a.v, 0)
    const b0 = jigPoint(geometry, b.s, b.v, 0)
    const b1 = jigPoint(geometry, b.s, b.v, geometry.height)
    const a1 = jigPoint(geometry, a.s, a.v, geometry.height)
    facets.push(stlFacet([a0, b0, b1], desiredNormal))
    facets.push(stlFacet([a0, b1, a1], desiredNormal))
  }
}

export function generateJigStl(params = {}) {
  const geometry = getJigGeometry(params)
  const facets = []

  addFilledInnerBand(facets, geometry)

  return [
    `solid string_art_jig_r${Math.round(geometry.radius)}_${geometry.pins}pins`,
    ...facets,
    'endsolid string_art_jig'
  ].join('\n')
}

export function generateJigScad(params = {}) {
  const geometry = getJigGeometry(params)
  const stationRows = geometry.stations
    .map(station => `[${station.x.toFixed(4)}, ${station.y.toFixed(4)}, ${station.isAnchor ? 1 : 0}]`)
    .join(',\n  ')
  const bandSegments = 80
  const outerRows = Array.from({ length: bandSegments + 1 }, (_, i) => {
    const angle = geometry.bandStartAngle + (geometry.bandEndAngle - geometry.bandStartAngle) * i / bandSegments
    const [x, y] = circlePoint(geometry, angle, geometry.bandOuterRadius, 0)
    return `[${x.toFixed(4)}, ${y.toFixed(4)}]`
  })
  const innerRows = Array.from({ length: bandSegments + 1 }, (_, i) => {
    const angle = geometry.bandEndAngle - (geometry.bandEndAngle - geometry.bandStartAngle) * i / bandSegments
    const [x, y] = circlePoint(geometry, angle, geometry.bandInnerRadius, 0)
    return `[${x.toFixed(4)}, ${y.toFixed(4)}]`
  })
  const bandRows = [...outerRows, ...innerRows]
    .join(',\n  ')

  return `// ====================================
// String Art — Dima chiodi curva
// Generata da String Art Generator
// ====================================
//
// Uso: aprire in OpenSCAD -> File -> Export -> STL
// La geometria segue l'arco reale del canvas:
// distanza tra pin = 2 * PI * raggio / numero_pin.

// --- Parametri calcolati ---
circle_radius_mm = ${geometry.radius.toFixed(2)};
pin_count        = ${geometry.pins};
hole_count       = ${geometry.guides};
pin_arc_mm       = ${geometry.pinArc.toFixed(3)};
nail_d           = ${geometry.nailD.toFixed(2)};
clearance        = ${geometry.clearance.toFixed(2)};
hole_d           = ${geometry.holeDiameter.toFixed(2)};
jig_h            = ${geometry.height.toFixed(2)};
guide_outer_r    = ${geometry.guideOuterRadius.toFixed(2)};
anchor_outer_r   = ${geometry.anchorOuterRadius.toFixed(2)};
bridge_w         = ${geometry.bridgeWidth.toFixed(2)};
inner_fill_mm    = ${geometry.innerFillOffset.toFixed(2)};
band_inner_r     = ${geometry.bandInnerRadius.toFixed(2)};
band_outer_r     = ${geometry.bandOuterRadius.toFixed(2)};
clip_gap_deg     = 112;

stations = [
  ${stationRows}
];

band_points = [
  ${bandRows}
];

$fn = 48;

module disk_at(p, r) {
  translate([p[0], p[1], 0]) cylinder(h = jig_h, r = r);
}

module anchor_clip(p) {
  translate([p[0], p[1], 0])
    difference() {
      cylinder(h = jig_h, r = anchor_outer_r);
      translate([0, 0, -1]) cylinder(h = jig_h + 2, d = hole_d);
      rotate([0, 0, atan2(p[1] - circle_radius_mm, p[0])])
        translate([0, -anchor_outer_r * 1.25, -1])
          cube([anchor_outer_r * 3, anchor_outer_r * 2.5, jig_h + 2], center = true);
    }
}

module guide_ring(p) {
  translate([p[0], p[1], 0])
    difference() {
      cylinder(h = jig_h, r = guide_outer_r);
      translate([0, 0, -1]) cylinder(h = jig_h + 2, d = hole_d);
    }
}

module bridge_between(a, b) {
  hull() {
    translate([a[0], a[1], 0]) cylinder(h = jig_h, d = bridge_w);
    translate([b[0], b[1], 0]) cylinder(h = jig_h, d = bridge_w);
  }
}

module filled_inner_band() {
  difference() {
    linear_extrude(jig_h) polygon(points = band_points);
    for (i = [0 : len(stations) - 1])
      translate([stations[i][0], stations[i][1], -1])
        cylinder(h = jig_h + 2, d = hole_d);
    for (i = [0 : len(stations) - 1])
      if (stations[i][2] == 1)
        rotate([0, 0, atan2(stations[i][1] - circle_radius_mm, stations[i][0])])
          translate([stations[i][0], stations[i][1] - anchor_outer_r * 0.72, -1])
            cube([anchor_outer_r * 1.9, anchor_outer_r * 2.4, jig_h + 2], center = true);
  }
}

union() {
  filled_inner_band();
}
`
}

function downloadTextFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadJigStl(params, pinCount, canvasRadiusCm) {
  const circleRadiusMm = Math.round((Number(canvasRadiusCm) || 30) * 10)
  const geometryParams = { ...params, circleRadiusMm, pinCount: pinCount || 160 }
  const stl = generateJigStl(geometryParams)
  downloadTextFile(stl, `string-art-jig-r${circleRadiusMm}mm-${pinCount}pin.stl`, 'model/stl')
}

export function downloadJigScad(params, pinCount, canvasRadiusCm) {
  const circleRadiusMm = Math.round((Number(canvasRadiusCm) || 30) * 10)
  const scad = generateJigScad({ ...params, circleRadiusMm, pinCount: pinCount || 160 })
  downloadTextFile(scad, `string-art-jig-r${circleRadiusMm}mm-${pinCount}pin.scad`, 'text/plain')
}
