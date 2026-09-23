import { getAdminClient } from '../../lib/supabase'
import { COUPLE, UPLOAD } from '../../lib/config'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: `Admin — ${COUPLE.full}`,
  robots: { index: false, follow: false },
}

export default async function AdminPage({ searchParams }) {
  const key = searchParams?.key
  const expected = process.env.ADMIN_KEY || 'changeme'
  if (key !== expected) {
    return (
      <main className="wrap">
        <div className="pagehead"><h1>🔒 Ιδιωτικό</h1></div>
        <div className="card"><p style={{ color: 'var(--ink)' }}>Άνοιξε τη σελίδα με <code>/admin?key=ΤΟ_ΜΥΣΤΙΚΟ_ΣΟΥ</code>.</p></div>
      </main>
    )
  }

  const sb = getAdminClient()
  // Ασφαλές fetch: αν κάποιο query αποτύχει (π.χ. λείπει πίνακας), επιστρέφει [] αντί να σκάσει η σελίδα.
  const safe = async (q) => { try { const { data } = await q; return data || [] } catch { return [] } }

  const rsvps = await safe(sb.from('rsvps')
    .select('attending, num_guests, message, created_at, guests(name)').order('created_at', { ascending: false }))
  const scores = await safe(sb.from('quiz_scores')
    .select('name, score, total, created_at').order('score', { ascending: false }).limit(50))
  const wishes = await safe(sb.from('wishes')
    .select('name, message, created_at').order('created_at', { ascending: false }))
  const media = await safe(sb.from('media')
    .select('path, kind, guest_name, message, phase, created_at').order('created_at', { ascending: false }))

  // signed URLs για προεπισκόπηση (ιδιωτικό bucket)
  const signed = {}
  const paths = media.map((m) => m.path)
  if (paths.length) {
    try {
      const { data: urls } = await sb.storage.from(UPLOAD.bucket).createSignedUrls(paths, 3600)
      urls?.forEach((u, i) => { if (u?.signedUrl) signed[paths[i]] = u.signedUrl })
    } catch {}
  }

  const yes = rsvps.filter((r) => r.attending)
  const totalPeople = yes.reduce((s, r) => s + (r.num_guests || 0), 0)
  const topScore = scores.length ? `${scores[0].score}/${scores[0].total}` : '—'
  const photoCount = media.filter((m) => m.kind === 'image').length
  const videoCount = media.filter((m) => m.kind === 'video').length

  return (
    <main className="wrap">
      <div className="pagehead"><h1>Wedding Dashboard</h1></div>

      <div className="card stats">
        <div className="stat"><div className="big">{yes.length}/{totalPeople}</div><div className="lbl">RSVP ναι / άτομα</div></div>
        <div className="stat"><div className="big">{scores.length}</div><div className="lbl">Quiz συμμετοχές</div></div>
        <div className="stat"><div className="big">{topScore}</div><div className="lbl">Καλύτερο σκορ</div></div>
        <div className="stat"><div className="big">{wishes.length}</div><div className="lbl">Ευχές</div></div>
        <div className="stat"><div className="big">{photoCount}+{videoCount}</div><div className="lbl">Φωτο + Βίντεο</div></div>
      </div>

      <h2>RSVP</h2>
      <div className="card">
        <table>
          <thead><tr><th>Καλεσμένος</th><th>Απάντηση</th><th>Άτομα</th><th>Μήνυμα</th></tr></thead>
          <tbody>
            {rsvps.map((r, i) => (
              <tr key={i}>
                <td>{r.guests?.name || '—'}</td>
                <td><span className={'pill ' + (r.attending ? 'yes' : 'no')}>{r.attending ? 'Ναι' : 'Όχι'}</span></td>
                <td>{r.attending ? r.num_guests : '—'}</td>
                <td>{r.message || ''}</td>
              </tr>
            ))}
            {rsvps.length === 0 && <tr><td colSpan="4" className="muted">Καμία απάντηση ακόμα.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2>Κουίζ — κατάταξη</h2>
      <div className="card">
        <table>
          <thead><tr><th>#</th><th>Όνομα</th><th>Σκορ</th></tr></thead>
          <tbody>
            {scores.slice(0, 20).map((s, i) => (
              <tr key={i}><td>{i + 1}</td><td>{s.name}</td><td>{s.score}/{s.total}</td></tr>
            ))}
            {scores.length === 0 && <tr><td colSpan="3" className="muted">Κανένα σκορ ακόμα.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2>Ευχές καλεσμένων 💌</h2>
      <div className="card">
        {wishes.map((w, i) => (
          <div key={i} className="wish"><div className="w-msg">{w.message}</div><div className="w-by">— {w.name}</div></div>
        ))}
        {wishes.length === 0 && <p className="muted">Καμία ευχή ακόμα.</p>}
      </div>

      <h2>Φωτογραφίες & βίντεο 📸</h2>
      <div className="card">
        {media.length === 0 && <p className="muted">Κανένα αρχείο ακόμα.</p>}
        <div className="gallery">
          {media.map((m, i) => (
            <a key={i} className="ph" href={signed[m.path] || '#'} target="_blank" rel="noopener noreferrer"
               title={[m.guest_name, m.message].filter(Boolean).join(' — ')}>
              {m.kind === 'image'
                ? <img src={signed[m.path]} alt={m.guest_name || 'φωτο'} loading="lazy" />
                : <span className="ph-vid">🎬<span className="ph-vlbl">Βίντεο</span></span>}
              {(m.guest_name || m.phase) && (
                <span className="ph-cap">{m.guest_name || 'Καλεσμένος'}{m.phase === 'before' ? ' · πριν' : ''}</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
