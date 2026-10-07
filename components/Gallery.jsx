'use client'
import { useState } from 'react'
import AdminDelete from './AdminDelete'

export default function Gallery({ items, adminKey, pageSize = 24 }) {
  const [page, setPage] = useState(0)
  const [dl, setDl] = useState(null) // {done, total}

  const pages = Math.max(1, Math.ceil(items.length / pageSize))
  const p = Math.min(page, pages - 1)
  const slice = items.slice(p * pageSize, (p + 1) * pageSize)

  async function downloadAll() {
    if (!items.length || dl) return
    setDl({ done: 0, total: items.length })
    let done = 0
    for (const it of items) {
      try {
        const res = await fetch(it.url)
        const blob = await res.blob()
        const u = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = u; a.download = it.filename || 'media'
        document.body.appendChild(a); a.click(); a.remove()
        URL.revokeObjectURL(u)
      } catch {}
      done++; setDl({ done, total: items.length })
      await new Promise((r) => setTimeout(r, 300)) // μικρή παύση ανά αρχείο
    }
    setDl(null)
  }

  return (
    <div className="card">
      {items.length === 0 && <p className="muted">Κανένα αρχείο ακόμα.</p>}

      {items.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <span className="muted">{items.length} αρχεία</span>
          <button className="btn" style={{ width: 'auto', margin: 0, padding: '10px 16px' }} onClick={downloadAll} disabled={!!dl}>
            {dl ? `Κατέβασμα… ${dl.done}/${dl.total}` : '⬇️ Κατέβασε όλα'}
          </button>
        </div>
      )}

      <div className="gallery">
        {slice.map((m) => (
          <div key={m.id} className="ph-wrap">
            <a className="ph" href={m.url || '#'} target="_blank" rel="noopener noreferrer" title={m.caption}>
              {m.kind === 'image'
                ? <img src={m.url} alt={m.caption || 'φωτο'} loading="lazy" />
                : <span className="ph-vid">🎬<span className="ph-vlbl">Βίντεο</span></span>}
              {m.caption && <span className="ph-cap">{m.caption}</span>}
            </a>
            <AdminDelete adminKey={adminKey} endpoint="/api/admin/delete-media" payload={{ id: m.id, path: m.path }}
              confirmText="Διαγραφή αυτού του αρχείου;" className="del-btn ph-del" />
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="pager">
          <button className="pg-btn" disabled={p === 0} onClick={() => setPage(p - 1)}>← Προηγ.</button>
          <span className="muted">Σελίδα {p + 1}/{pages}</span>
          <button className="pg-btn" disabled={p >= pages - 1} onClick={() => setPage(p + 1)}>Επόμ. →</button>
        </div>
      )}
    </div>
  )
}
