import { COUPLE, WEDDING } from '../lib/config'
import Ornament from '../components/Ornament'
import CornerLeaves from '../components/CornerLeaves'

export const metadata = { title: COUPLE.full }

export default function Home() {
  return (
    <main className="wrap">
      <section className="hero">
        <CornerLeaves />
        <div className="eyebrow r r1">{WEDDING.invite}</div>
        <Ornament className="ornament r r2" width={172} />
        <h1 className="names stack r r3">
          <span>{COUPLE.a}</span>
          <span className="amp">&</span>
          <span>{COUPLE.b}</span>
        </h1>
        <p className="tagline r r4">{WEDDING.date} · {WEDDING.place}</p>
        <a className="btn cta r r5" href="/party">Είσοδος →</a>
      </section>

      <div className="footer r r6">{WEDDING.closing}, {COUPLE.a} & {COUPLE.b}</div>
    </main>
  )
}
