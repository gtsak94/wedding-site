import { getAdminClient } from '../../../../lib/supabase'
import { UPLOAD } from '../../../../lib/config'

export async function POST(req) {
  try {
    const { key, id, path } = await req.json()
    if (key !== (process.env.ADMIN_KEY || 'changeme')) {
      return Response.json({ error: 'unauthorized' }, { status: 401 })
    }
    if (!id) return Response.json({ error: 'bad request' }, { status: 400 })
    const sb = getAdminClient()
    if (path) { try { await sb.storage.from(UPLOAD.bucket).remove([path]) } catch {} }
    const { error } = await sb.from('media').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: String(e.message || e) }, { status: 500 })
  }
}
