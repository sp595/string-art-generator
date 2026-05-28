export function generateJigScad({
  circleRadiusMm = 300,
  pinCount = 160,
  holeCount = 6,
  nailDiameterMm = 1.8,
  clearanceMm = 0.3,
  jigHeightMm = 18,
  jigDepthMm = 25,
  marginMm = 8
} = {}) {
  return `// ====================================
// String Art — Dima chiodi
// Generata da String Art Generator
// ====================================
//
// Uso: aprire in OpenSCAD → File → Export → STL
// Incollare i parametri secondo il proprio progetto

// --- Parametri ---
circle_radius_mm = ${circleRadiusMm};   // Raggio cerchio [mm] = canvasRadiusCm × 10
pin_count        = ${pinCount};          // Numero totale di pin
hole_count       = ${holeCount};         // Fori per sessione (5–8)
nail_d           = ${nailDiameterMm};   // Diametro gambo chiodo [mm]
clearance        = ${clearanceMm};      // Gioco inserimento [mm]
jig_h            = ${jigHeightMm};      // Altezza dima [mm]
jig_depth        = ${jigDepthMm};       // Profondità appoggio [mm]
side_margin      = ${marginMm};         // Margine laterale oltre i fori [mm]

$fn = 24;  // risoluzione cilindri

// --- Derivati ---
pin_arc   = 2 * PI * circle_radius_mm / pin_count;   // distanza arco tra pin [mm]
jig_w     = (hole_count - 1) * pin_arc + 2 * side_margin;
hole_d    = nail_d + 2 * clearance;

// --- Corpo dima con fori ---
difference() {
  // Blocco principale
  cube([jig_w, jig_depth, jig_h]);

  // Fori guida chiodi, centrati in profondità
  for (i = [0 : hole_count - 1])
    translate([side_margin + i * pin_arc, jig_depth / 2, -1])
      cylinder(h = jig_h + 2, d = hole_d);

  // Scanalatura sul fondo lato interno (evita chiodi già inseriti)
  translate([-0.1, jig_depth / 2 + hole_d, -0.1])
    cube([jig_w + 0.2, jig_depth / 2 - hole_d + 0.1, nail_d + 2]);
}

// --- Freccia direzionale incisa in superficie ---
translate([jig_w / 2, jig_depth / 2, jig_h - 0.8])
  linear_extrude(1)
    polygon([[-2.5, -3.5], [2.5, -3.5], [0, 3.5]]);
`
}

export function downloadJigScad(params, pinCount, canvasRadiusCm) {
  const circleRadiusMm = Math.round((Number(canvasRadiusCm) || 30) * 10)
  const scad = generateJigScad({ ...params, circleRadiusMm, pinCount: pinCount || 160 })
  const blob = new Blob([scad], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `string-art-jig-r${circleRadiusMm}mm-${pinCount}pin.scad`
  a.click()
  URL.revokeObjectURL(url)
}
