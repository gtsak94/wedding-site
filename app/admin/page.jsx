import { getAdminClient } from '../../lib/supabase'
import { COUPLE, UPLOAD } from '../../lib/config'
import AdminManage from '../../components/AdminManage'
import AdminDelete from '../../components/AdminDelete'
import CopyLink from '../../components/CopyLink'
import PagedTable from '../../components/PagedTable'
import Paginator from '../../components/Paginator'
import Gallery from '../../components/Gallery'

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

  // ---- Προετοιμασία γραμμών για τους paginated πίνακες ----
  const rsvpRows = rsvps.map((r, i) => ({
    key: i,
    cells: [
      r.guests?.name || '—',
      <span className={'pill ' + (r.attending ? 'yes' : 'no')}>{r.attending ? 'Ναι' : 'Όχι'}</span>,
      r.attending ? r.num_guests : '—',
      r.message || '',
    ],
  }))

  const partRows = guests.map((g) => {
    const rsvp = rsvpByGuest[g.id]
    return {
      key: g.id,
      cells: [
        <span>{g.name} <CopyLink token={g.token} /></span>,
        rsvp === true ? <span className="pill yes">Ναι</span> : rsvp === false ? <span className="pill no">Όχι</span> : <span className="muted">—</span>,
        photosByGuest[g.id] || '—',
        videosByGuest[g.id] || '—',
        wishedGuest[g.id] ? '✓' : '—',
        bestQuizByGuest[g.id] != null ? `${bestQuizByGuest[g.id]}/${quizTotal}` : '—',
        <AdminDelete adminKey={key} endpoint="/api/admin/delete-guest" payload={{ id: g.id }} confirmText={`Διαγραφή του/της ${g.name}; (θα φύγει και το RSVP του)`} />,
      ],
    }
  })

  const quizRows = scores.map((s, i) => ({ key: i, cells: [i + 1, s.name, `${s.score}/${s.total}`] }))

  const mediaItems = media.map((m) => ({
    id: m.id,
    path: m.path,
    kind: m.kind,
    url: signed[m.path],
    caption: m.guest_name || '',
    filename: `${(m.guest_name || 'anonymous').replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 40)}__${m.path.split('/').pop()}`,
  }))

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
      <PagedTable header={['Καλεσμένος', 'Απάντηση', 'Άτομα', 'Μήνυμα']} rows={rsvpRows} pageSize={15} empty="Καμία απάντηση ακόμα." />

      <h2>Συμμετοχή ανά καλεσμένο</h2>
      <PagedTable header={['Καλεσμένος', 'RSVP', '📸', '🎬', '💌', '🧠', '']} rows={partRows} pageSize={15} empty="Κανένας καλεσμένος ακόμα (τρέξε το seed)." />
      <p className="muted" style={{ margin: '-6px 0 0' }}>Μετρώνται μόνο όσα έγιναν από το προσωπικό link του καθενός. Οι ανώνυμες συμμετοχές (κοινό QR) φαίνονται στους πίνακες πιο κάτω.</p>

      <h2>Κουίζ — κατάταξη</h2>
      <PagedTable header={['#', 'Όνομα', 'Σκορ']} rows={quizRows} pageSize={20} empty="Κανένα σκορ ακόμα." />

      <h2>Ευχές καλεσμένων 💌</h2>
      <div className="card">
        <Paginator pageSize={10} empty="Καμία ευχή ακόμα.">
          {wishes.map((w, i) => (
            <div key={i} className="wish"><div className="w-msg">{w.message}</div><div className="w-by">— {w.name}</div></div>
          ))}
        </Paginator>
      </div>

      <h2>Φωτογραφίες & βίντεο 📸</h2>
      <Gallery items={mediaItems} adminKey={key} pageSize={24} />
    </main>
  )
}
