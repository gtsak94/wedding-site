import { getAdminClient } from '../../../lib/supabase'
import { COUPLE } from '../../../lib/config'
import Ornament from '../../../components/Ornament'
import RsvpForm from './RsvpForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: `RSVP — ${COUPLE.full}` }

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
            Το link δεν αντιστοιχεί σε καλεσμένο. Έλεγξε ότι έτρεξες
            <code> npm run seed </code> και ότι το token είναι σωστό.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="wrap">
      <div className="pagehead">
        <Ornament className="ornament" width={160} />
        <div className="eyebrow">{COUPLE.full}</div>
        <h1>Αγαπητέ/ή {guest.name} 💌</h1>
        <p>Θα χαρούμε πολύ να σε έχουμε κοντά μας. Θα έρθεις;</p>
      </div>
      <RsvpForm token={token} existing={existing} />
    </main>
  )
}
