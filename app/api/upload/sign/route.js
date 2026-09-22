import { randomUUID } from 'crypto'
import { getAdminClient } from '../../../../lib/supabase'
import { UPLOAD } from '../../../../lib/config'

// Επιστρέφει ένα signed URL για απευθείας ανέβασμα του αρχείου στο Supabase Storage.
// Ο client ανεβάζει ΚΑΤΕΥΘΕΙΑΝ εκεί (ο server δεν γίνεται bottleneck).
export async function POST(req) {
  try {
    const { filename, contentType } = await req.json()
    if (!filename || !contentType) {
      return Response.json({ error: 'bad request' }, { status: 400 })
    }

    const isImage = contentType.startsWith('image/')
    const isVideo = contentType.startsWith('video/')
    if (!isImage && !isVideo) {
      return Response.json({ error: 'Δεκτά μόνο εικόνες ή βίντεο.' }, { status: 415 })
    }

    // ασφαλής κατάληξη + μοναδικό όνομα, οργανωμένο ανά ημερομηνία
    const ext = (filename.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5)
    const day = new Date().toISOString().slice(0, 10)
    const path = `${day}/${randomUUID()}.${ext || 'bin'}`

    const sb = getAdminClient()
    const { data, error } = await sb.storage.from(UPLOAD.bucket).createSignedUploadUrl(path)
    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ path, signedUrl: data.signedUrl, kind: isImage ? 'image' : 'video' })
  } catch (e) {
    return Response.json({ error: 'server error' }, { status: 500 })
  }
}
