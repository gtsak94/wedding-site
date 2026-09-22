// Γωνιακά eucalyptus φυλλώματα που πλαισιώνουν το hero (όπως στο mockup).
// Δύο instances (πάνω-αριστερά & κάτω-δεξιά) μπαίνουν μέσα στο .hero.
import { Branch } from './Ornament'

// Ένα πλούσιο γωνιακό σπρέι: κύριο κλαδί + δύο δευτερεύοντα, με μια blue-green πινελιά.
function Spray() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true" role="presentation">
      {/* κύριο κλαδί — κατεβαίνει κατά μήκος της αριστερής ακμής */}
      <Branch p0={[14, 6]} p1={[34, 60]} p2={[40, 110]} p3={[34, 170]} count={8} leaf={16} />
      {/* δευτερεύον κλαδί — απλώνει οριζόντια στην πάνω ακμή */}
      <Branch p0={[20, 12]} p1={[70, 26]} p2={[120, 34]} p3={[172, 34]} count={7} leaf={14} />
      {/* λεπτή blue-green πινελιά για βάθος */}
      <g className="accent">
        <Branch p0={[16, 10]} p1={[58, 52]} p2={[86, 78]} p3={[118, 96]} count={5} leaf={11} />
      </g>
    </svg>
  )
}

export default function CornerLeaves() {
  return (
    <>
      <div className="leaf-corner tl"><Spray /></div>
      <div className="leaf-corner br"><Spray /></div>
    </>
  )
}
