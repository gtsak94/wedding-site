'use client'
import { useState } from 'react'

// Γενικός πίνακας με client-side pagination.
// header: string[]  ·  rows: { key, cells: ReactNode[] }[]
export default function PagedTable({ header, rows, pageSize = 15, empty = 'Τίποτα ακόμα.' }) {
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(rows.length / pageSize))
  const p = Math.min(page, pages - 1)
  const slice = rows.slice(p * pageSize, (p + 1) * pageSize)

  return (
    <div className="card">
      <table>
        <thead><tr>{header.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
        <tbody>
          {slice.map((r) => <tr key={r.key}>{r.cells.map((c, i) => <td key={i}>{c}</td>)}</tr>)}
          {rows.length === 0 && <tr><td colSpan={header.length} className="muted">{empty}</td></tr>}
        </tbody>
      </table>
      {pages > 1 && (
        <div className="pager">
          <button className="pg-btn" disabled={p === 0} onClick={() => setPage(p - 1)}>← Προηγ.</button>
          <span className="muted">Σελίδα {p + 1}/{pages} · {rows.length} σύνολο</span>
          <button className="pg-btn" disabled={p >= pages - 1} onClick={() => setPage(p + 1)}>Επόμ. →</button>
        </div>
      )}
    </div>
  )
}
