import { COUPLE, WEDDING } from '../../lib/config'
import Ornament from '../../components/Ornament'
import CornerLeaves from '../../components/CornerLeaves'

export const metadata = { title: `${COUPLE.full}` }

export default function PartyPage() {
  return (
    <main className="wrap">
      <section className="hero">
        <CornerLeaves />
        <Ornament className="ornament r r1" width={190} />
        <div className="eyebrow r r2">{WEDDING.date} · {WEDDING.place}</div>
        <h1 className="names stack r r3">
          <span>{COUPLE.a}</span>
          <span className="amp">&</span>
          <span>{COUPLE.b}</span>
        </h1>
        <p className="tagline r r3">«{WEDDING.tagline}»</p>
      </section>

      <div className="actions">
        <a className="action r r4" href="/upload">
          <span className="ic">📸</span>
          <span className="tx">
            <span className="t">Ανέβασε φωτογραφίες & βίντεο</span>
            <span className="s">Ο φωτογράφος δεν είναι παντού — εσύ όμως είσαι!</span>
          </span>
          <span className="chev">→</span>
        </a>

        <a className="action r r5" href="/quiz">
          <span className="ic">🧠</span>
          <span className="tx">
            <span className="t">Πόσο καλά μας ξέρεις;</span>
            <span className="s">10 γρήγορες ερωτήσεις — με αστείο φινάλε</span>
          </span>
          <span className="chev">→</span>
        </a>

        <a className="action r r6" href="/wishes">
          <span className="ic">💌</span>
          <span className="tx">
            <span className="t">Άφησε μια ευχή</span>
            <span className="s">Δυο λόγια που θα μείνουν για πάντα</span>
          </span>
          <span className="chev">→</span>
        </a>
      </div>

      <div className="footer r r6">{WEDDING.closing}, {COUPLE.a} & {COUPLE.b}</div>
    </main>
  )
}
