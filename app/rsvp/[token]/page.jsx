import { getAdminClient } from '../../../lib/supabase'
import { COUPLE } from '../../../lib/config'
import Ornament from '../../../components/Ornament'
import RsvpForm from './RsvpForm'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: `Πρόσκληση — ${COUPLE.full}`,
  robots: { index: false, follow: false },
}

export default async function RsvpPage({ params }) {
  const { token } = params
  let guest = null, existing = null
  try {
    const sb = getAdminClient()
    const { data: g } = await sb.from('guests').select('id, name').eq('token', token).single()
    guest = g
    if (guest) {
      const { data: r } = await sb.from('rsvps').select('attending, num_guests, message').eq('guest_id', guest.id).maybeSingle()
      existing = r
    }
  } catch (e) {}

  if (!guest) {
    return (
      <main className="wrap">
        <div className="pagehead"><h1>Πρόσκληση</h1></div>
        <div className="card">
          <p style={{ color: 'var(--ink)' }}>
            Το link δεν αντιστοιχεί σε καλεσμένο. Έλεγξε ότι το άνοιξες σωστά — ή ζήτησέ το ξανά.
          </p>
        </div>
      </main>
    )
  }

  // token + όνομα ταξιδεύουν στα actions ώστε φωτο/quiz/ευχές να χρεώνονται στον καλεσμένο
  const q = `?t=${encodeURIComponent(token)}&n=${encodeURIComponent(guest.name)}`

  return (
    <main className="wrap">
      <div className="pagehead">
        <Ornament className="ornament r r1" width={160} />
        <div className="eyebrow r r2">{COUPLE.full}</div>
        <h1 className="r r2">Γεια σου, {guest.name} 👋</h1>
        <p className="r r2">Θα χαρούμε πολύ να σε έχουμε κοντά μας. Θα έρθεις;</p>
      </div>

      <RsvpForm token={token} existing={existing} />

      <h2 style={{ textAlign: 'center' }}>Και λίγα ακόμα…</h2>
      <div className="actions">
        <a className="action" href={`/upload${q}`}>
          <span className="ic">📸</span>
          <span className="tx">
            <span className="t">Ανέβασε φωτογραφίες & βίντεο</span>
            <span className="s">Οι στιγμές σου, με το όνομά σου</span>
          </span>
          <span className="chev">→</span>
        </a>
        <a className="action" href={`/quiz${q}`}>
          <span className="ic">🧠</span>
          <span className="tx">
            <span className="t">Πόσο καλά μας ξέρεις;</span>
            <span className="s">10 γρήγορες ερωτήσεις — με αστείο φινάλε</span>
          </span>
          <span className="chev">→</span>
        </a>
        <a className="action" href={`/wishes${q}`}>
          <span className="ic">💌</span>
          <span className="tx">
            <span className="t">Άφησε μια ευχή</span>
            <span className="s">Δυο λόγια που θα μείνουν για πάντα</span>
          </span>
          <span className="chev">→</span>
        </a>
      </div>

      <div className="footer">με αγάπη, {COUPLE.a} & {COUPLE.b}</div>
    </main>
  )
}
