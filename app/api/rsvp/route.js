import { getAdminClient } from '../../../lib/supabase'

export async function POST(req) {
  try {
    const { token, attending, num_guests, message } = await req.json()
    if (!token || typeof attending !== 'boolean') {
      return Response.json({ error: 'bad request' }, { status: 400 })
    }
    const sb = getAdminClient()

    const { data: guest } = await sb
      .from('guests').select('id').eq('token', token).single()
    if (!guest) return Response.json({ error: 'unknown guest' }, { status: 404 })

    // one RSVP per guest — upsert on guest_id (unique)
    const { error } = await sb.from('rsvps').upsert(
      {
        guest_id: guest.id,
        attending,
        num_guests: attending ? Math.max(1, Number(num_guests) || 1) : 0,
        message: message || null,
      },
      { onConflict: 'guest_id' }
    )
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: String(e.message || e) }, { status: 500 })
  }
}
