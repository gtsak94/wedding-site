// Διακριτικό eucalyptus κλαδί — η «υπογραφή» του σχεδιασμού.
// Καθαρό presentational component (χωρίς hooks) — δουλεύει σε server & client σελίδες.
// Τα φύλλα τοποθετούνται παραμετρικά πάνω σε καμπύλη Bézier για φυσική αίσθηση.

function cubic(p0, p1, p2, p3, t) {
  const u = 1 - t
  const x = u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0]
  const y = u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]
  return [x, y]
}
function tangent(p0, p1, p2, p3, t) {
  const u = 1 - t
  const x = 3*u*u*(p1[0]-p0[0]) + 6*u*t*(p2[0]-p1[0]) + 3*t*t*(p3[0]-p2[0])
  const y = 3*u*u*(p1[1]-p0[1]) + 6*u*t*(p2[1]-p1[1]) + 3*t*t*(p3[1]-p2[1])
  return Math.atan2(y, x) * 180 / Math.PI
}

// Ένα eucalyptus κλαδί: στέλεχος + εναλλασσόμενα ζευγάρια φύλλων κατά μήκος του.
function Branch({ p0, p1, p2, p3, count = 7, leaf = 8, from = 0.12, to = 0.98 }) {
  const stem = `M${p0[0]} ${p0[1]} C ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`
  const leaves = []
  for (let i = 0; i < count; i++) {
    const t = from + (to - from) * (i / (count - 1))
    const [x, y] = cubic(p0, p1, p2, p3, t)
    const ang = tangent(p0, p1, p2, p3, t)
    const grow = 0.5 + 0.5 * Math.sin(Math.PI * t)        // μικρότερα φύλλα στις άκρες
    const rx = leaf * grow, ry = leaf * 0.34 * grow       // επιμήκη eucalyptus φύλλα
    const op = 0.5 + 0.22 * Math.sin(Math.PI * t)
    // ζευγάρι φύλλων εκατέρωθεν του στελέχους
    leaves.push(
      <ellipse key={`a${i}`} cx={x} cy={y} rx={rx} ry={ry}
        transform={`rotate(${ang + 48} ${x - rx*0.5} ${y})`} fillOpacity={op} />
    )
    leaves.push(
      <ellipse key={`b${i}`} cx={x} cy={y} rx={rx} ry={ry}
        transform={`rotate(${ang - 48} ${x - rx*0.5} ${y})`} fillOpacity={op} />
    )
  }
  return (
    <g>
      <path d={stem} stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" fillOpacity="1" />
      <g fill="currentColor" stroke="none">{leaves}</g>
    </g>
  )
}

export default function Ornament({ className = '', width = 200 }) {
  return (
    <svg className={className} width={width} viewBox="0 0 240 64" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation">
      {/* αριστερό κλαδί προς το κέντρο */}
      <Branch p0={[14, 40]} p1={[50, 44]} p2={[88, 28]} p3={[116, 30]} count={6} leaf={9} />
      {/* δεξί κλαδί (κατοπτρικό) */}
      <g transform="translate(240,0) scale(-1,1)">
        <Branch p0={[14, 40]} p1={[50, 44]} p2={[88, 28]} p3={[116, 30]} count={6} leaf={9} />
      </g>
      {/* κεντρικό μπουμπούκι */}
      <ellipse cx="120" cy="30" rx="3" ry="5.5" fill="currentColor" fillOpacity="0.9" />
    </svg>
  )
}

export { Branch }
