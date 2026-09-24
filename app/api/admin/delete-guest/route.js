import { getAdminClient } from '../../../../lib/supabase'

export async function POST(req) {
  try {
    const { key, id } = await req.json()
    if (key !== (process.env.ADMIN_KEY || 'changeme')) {
      return Response.json({ error: 'unauthorized' }, { status: 401 })
    }
    if (!id) return Response.json({ error: 'bad request' }, { status: 400 })
    const sb = getAdminClient()
    // rsvps: cascade· media/wishes/quiz: guest_id → null (μένουν ως ανώνυμα)
    const { error } = await sb.from('guests').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: String(e.message || e) }, { status: 500 })
  }
}
