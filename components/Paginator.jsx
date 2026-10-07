'use client'
import { useState, Children } from 'react'

// Γενικό pagination για λίστα από nodes (π.χ. ευχές). Παίρνει children και δείχνει
// ένα «παράθυρο» κάθε φορά, με κουμπιά Προηγ./Επόμ.
export default function Paginator({ children, pageSize = 10, empty = 'Τίποτα ακόμα.' }) {
  const items = Children.toArray(children)
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(items.length / pageSize))
  const p = Math.min(page, pages - 1)
  const slice = items.slice(p * pageSize, (p + 1) * pageSize)

  return (
    <>
      {items.length === 0 && <p className="muted">{empty}</p>}
      {slice}
      {pages > 1 && (
        <div className="pager">
          <button className="pg-btn" disabled={p === 0} onClick={() => setPage(p - 1)}>← Προηγ.</button>
          <span className="muted">Σελίδα {p + 1}/{pages} · {items.length} σύνολο</span>
          <button className="pg-btn" disabled={p >= pages - 1} onClick={() => setPage(p + 1)}>Επόμ. →</button>
        </div>
      )}
    </>
  )
}
