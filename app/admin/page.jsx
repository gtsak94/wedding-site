import { getAdminClient } from '../../lib/supabase'
import { COUPLE, UPLOAD } from '../../lib/config'
import AdminManage from '../../components/AdminManage'
import AdminDelete from '../../components/AdminDelete'
import CopyLink from '../../components/CopyLink'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
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

  const guests = await safe(sb.from('guests').select('id, name, token').order('name', { ascending: true }))
  const rsvps = await safe(sb.from('rsvps')
    .select('guest_id, attending, num_guests, message, created_at, guests(name)').order('created_at', { ascending: false }))
  const scores = await safe(sb.from('quiz_scores')
    .select('guest_id, name, score, total, created_at').order('score', { ascending: false }).limit(200))
  const wishes = await safe(sb.from('wishes')
    .select('guest_id, name, message, created_at').order('created_at', { ascending: false }))
  const media = await safe(sb.from('media')
    .select('id, guest_id, path, kind, guest_name, message, phase, created_at').order('created_at', { ascending: false }))

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

  // Συμμετοχή ανά καλεσμένο (μόνο όσα ήρθαν από προσωπικό link → έχουν guest_id)
  const rsvpByGuest = {}
  rsvps.forEach((r) => { if (r.guest_id) rsvpByGuest[r.guest_id] = r.attending })
  const countBy = (arr) => arr.reduce((m, x) => { if (x.guest_id) m[x.guest_id] = (m[x.guest_id] || 0) + 1; return m }, {})
  const photosByGuest = countBy(media.filter((m) => m.kind === 'image'))
  const videosByGuest = countBy(media.filter((m) => m.kind === 'video'))
  const bestQuizByGuest = {}
  scores.forEach((s) => { if (s.guest_id && (bestQuizByGuest[s.guest_id] == null || s.score > bestQuizByGuest[s.guest_id])) bestQuizByGuest[s.guest_id] = s.score })
  const wishedGuest = {}
  wishes.forEach((w) => { if (w.guest_id) wishedGuest[w.guest_id] = true })
  const quizTotal = scores.length ? scores[0].total : 10

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

      <h2>Διαχείριση</h2>
      <AdminManage adminKey={key} />

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

      <h2>Συμμετοχή ανά καλεσμένο</h2>
      <div className="card">
        <table>
          <thead><tr><th>Καλεσμένος</th><th>RSVP</th><th>📸</th><th>🎬</th><th>💌</th><th>🧠</th><th></th></tr></thead>
          <tbody>
            {guests.map((g) => {
              const rsvp = rsvpByGuest[g.id]
              return (
                <tr key={g.id}>
                  <td>{g.name} <CopyLink token={g.token} /></td>
                  <td>{rsvp === true ? <span className="pill yes">Ναι</span> : rsvp === false ? <span className="pill no">Όχι</span> : <span className="muted">—</span>}</td>
                  <td>{photosByGuest[g.id] || '—'}</td>
                  <td>{videosByGuest[g.id] || '—'}</td>
                  <td>{wishedGuest[g.id] ? '✓' : '—'}</td>
                  <td>{bestQuizByGuest[g.id] != null ? `${bestQuizByGuest[g.id]}/${quizTotal}` : '—'}</td>
                  <td><AdminDelete adminKey={key} endpoint="/api/admin/delete-guest" payload={{ id: g.id }} confirmText={`Διαγραφή του/της ${g.name}; (θα φύγει και το RSVP του)`} /></td>
                </tr>
              )
            })}
            {guests.length === 0 && <tr><td colSpan="7" className="muted">Κανένας καλεσμένος ακόμα (τρέξε το seed).</td></tr>}
          </tbody>
        </table>
        <p className="muted" style={{ marginTop: 10 }}>Μετρώνται μόνο όσα έγιναν από το προσωπικό link του καθενός. Οι ανώνυμες συμμετοχές (κοινό QR) φαίνονται στους πίνακες πιο κάτω.</p>
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
            <div key={i} className="ph-wrap">
              <a className="ph" href={signed[m.path] || '#'} target="_blank" rel="noopener noreferrer"
                 title={[m.guest_name, m.message].filter(Boolean).join(' — ')}>
                {m.kind === 'image'
                  ? <img src={signed[m.path]} alt={m.guest_name || 'φωτο'} loading="lazy" />
                  : <span className="ph-vid">🎬<span className="ph-vlbl">Βίντεο</span></span>}
                {(m.guest_name || m.phase) && (
                  <span className="ph-cap">{m.guest_name || 'Καλεσμένος'}{m.phase === 'before' ? ' · πριν' : ''}</span>
                )}
              </a>
              <AdminDelete adminKey={key} endpoint="/api/admin/delete-media" payload={{ id: m.id, path: m.path }}
                confirmText="Διαγραφή αυτού του αρχείου;" className="del-btn ph-del" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
