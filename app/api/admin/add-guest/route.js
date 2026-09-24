import { randomBytes } from 'crypto'
import { getAdminClient } from '../../../../lib/supabase'

export async function POST(req) {
  try {
    const { key, name } = await req.json()
    if (key !== (process.env.ADMIN_KEY || 'changeme')) {
      return Response.json({ error: 'unauthorized' }, { status: 401 })
    }
    if (!name || !name.trim()) return Response.json({ error: 'empty' }, { status: 400 })
    const sb = getAdminClient()
    const token = randomBytes(5).toString('hex')
    const { error } = await sb.from('guests').insert({ name: name.trim().slice(0, 120), token })
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true, token })
  } catch (e) {
    return Response.json({ error: String(e.message || e) }, { status: 500 })
  }
}
