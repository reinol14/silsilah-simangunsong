import Link from "next/link";

const C = {
  merah: "#8B1A1A",
  merahTua: "#5C0E0E",
  merahTerang: "#C0392B",
  emas: "#C9A84C",
  emasM: "#E8CC7A",
  emasT: "#8B6914",
  hitam: "#0D0B08",
  hitamL: "#1A1612",
  krem: "#F5EDD8",
  kremT: "#E8D9B8",
  putih: "#FDF8EE",
};

const principles = [
  {
    title: "Inklusif",
    quote: "Na pinukka na parjolo (sijolo-jolo tubu) diihuthon siala dipatupa na parpudi (sisonari)",
    text: "Awal yang inklusif atau dasar yang luas atau dimulai dipulihkan, direstorasi, within new covenant by love, mercy, grace and dynamic transforming dengan dasar yang kuat sehingga dapat berkembang dan berbuah baik.",
  },
  {
    title: "Integratif",
    quote: "Rundut ni eme do gabe na",
    text: "Batang padi yang berbuat lebat akan membungkuk. Sesuatu yang berbuah lebat dan berhasil harus memiliki sifat integratif atau kemampuan memadukan berbagai aspek sehingga menjadi satu kesatuan yang harmoni. Tampakna do rantosna, rim ni tahi do gogonta.",
  },
  {
    title: "Berkelanjutan",
    quote: "Eme na masa digagat Ursa, aha na masa i ma taula",
    text: "Sesuatu yang kuat dan berakar akan dapat bertahan dan berkelanjutan seperti padi yang masak yang tetap berdiri tegak meskipun terkena angin atau cuaca buruk.",
  },
  {
    title: "No One Left Behind",
    quote: "Boan sada na i",
    text: "Tidak ada yang tertinggal. Prinsip ini memastikan semua keturunan Simangunsong diikutsertakan lintas generasi: Leluhur (Marga), Ompung & Buyut (Raja Simangunsong), Orangtua, Anak & Boru, serta Bere & Ibebere.",
  },
];

export default function TentangPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: C.hitam,
        color: C.krem,
        fontFamily: "'Cormorant Garamond',serif",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { opacity: 0; animation: fadeUp .85s ease forwards; }
        .d1 { animation-delay: .1s; }
        .d2 { animation-delay: .2s; }
        .d3 { animation-delay: .3s; }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            `radial-gradient(circle at 12% 15%, rgba(201,168,76,.18) 0%, transparent 35%),
             radial-gradient(circle at 88% 12%, rgba(139,26,26,.25) 0%, transparent 38%),
             linear-gradient(180deg, ${C.hitamL} 0%, ${C.hitam} 55%, ${C.hitamL} 100%)`,
          pointerEvents: "none",
        }}
      />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 20px 72px", position: "relative", zIndex: 2 }}>
        <section
          className="fade-up d1"
          style={{
            border: `1px solid rgba(201,168,76,.35)`,
            background: `linear-gradient(145deg, rgba(26,22,18,.9), rgba(13,11,8,.95))`,
            padding: "34px 24px",
            boxShadow: "0 24px 50px rgba(0,0,0,.35)",
            textAlign: "center",
          }}
        >
          <p style={{ color: C.merahTerang, letterSpacing: ".35em", textTransform: "uppercase", fontFamily: "'Cinzel',serif", fontSize: ".65rem", marginBottom: 12 }}>
            Informasi Website
          </p>
          <h1 style={{ fontFamily: "'Cinzel Decorative',cursive", fontSize: "clamp(1.8rem,4vw,3rem)", marginBottom: 10, color: C.putih }}>
            🪢🏦👩‍❤️‍👨👬 Situs Klan Kekinian Simangunsong
          </h1>
          <p style={{ fontFamily: "'IM Fell English',serif", fontStyle: "italic", color: C.emasM, fontSize: "1.15rem", marginBottom: 22 }}>
            Pembangunan Berkelanjutan
          </p>
          <div
            style={{
              height: 6,
              width: 260,
              margin: "0 auto 24px",
              background: `repeating-linear-gradient(90deg,${C.merah} 0px,${C.merah} 14px,${C.emas} 14px,${C.emas} 20px,${C.hitam} 20px,${C.hitam} 26px,${C.emas} 26px,${C.emas} 32px,${C.merah} 32px,${C.merah} 46px,${C.hitam} 46px,${C.hitam} 50px)`,
            }}
          />
          <p style={{ color: C.kremT, lineHeight: 1.8, maxWidth: 840, margin: "0 auto", fontSize: "1.05rem" }}>
            Situs Klan Simangunsong Kekinian adalah bagian kultur Batak yang bersifat lintas sektoral dan mendukung
            Tujuan Pembangunan Berkelanjutan (SDGs/TPB) dengan empat prinsip: inklusif, integratif, berkelanjutan,
            dan no one left behind.
          </p>
        </section>

        <section className="fade-up d2" style={{ marginTop: 34 }}>
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <p style={{ color: C.merahTerang, letterSpacing: ".35em", textTransform: "uppercase", fontFamily: "'Cinzel',serif", fontSize: ".65rem", marginBottom: 10 }}>
              Empat Pilar
            </p>
            <h2 style={{ fontFamily: "'Cinzel Decorative',cursive", fontSize: "clamp(1.5rem,3vw,2.35rem)", color: C.putih }}>
              Prinsip Pembangunan <span style={{ color: C.emas }}>Berkelanjutan</span>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {principles.map((item, idx) => (
              <article
                key={item.title}
                style={{
                  border: `1px solid rgba(201,168,76,.28)`,
                  background: "rgba(20,16,13,.86)",
                  padding: "18px 16px",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 10,
                    color: "rgba(201,168,76,.45)",
                    fontFamily: "'Cinzel',serif",
                    fontSize: ".85rem",
                    letterSpacing: ".2em",
                  }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 style={{ fontFamily: "'Cinzel',serif", color: C.emasM, marginBottom: 8, fontSize: "1rem", letterSpacing: ".06em" }}>
                  {item.title}
                </h3>
                <p style={{ color: C.krem, fontStyle: "italic", marginBottom: 10, lineHeight: 1.5, fontSize: ".98rem" }}>{item.quote}</p>
                <p style={{ color: C.kremT, lineHeight: 1.65, fontSize: ".98rem" }}>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="fade-up d3"
          style={{
            marginTop: 30,
            border: `1px solid rgba(201,168,76,.32)`,
            background: "rgba(16,13,10,.86)",
            padding: "24px 20px",
          }}
        >
          <h3 style={{ fontFamily: "'Cinzel',serif", color: C.emasM, marginBottom: 14, letterSpacing: ".08em", textTransform: "uppercase", fontSize: ".9rem" }}>
            Fondasi Dalihan Na Tolu
          </h3>
          <p style={{ color: C.krem, lineHeight: 1.75, marginBottom: 12 }}>
            Manat mardongan-tubu jumolo dung i, elek marboru asa tanda hita na somba marhula-hula.
          </p>
          <p style={{ color: C.kremT, lineHeight: 1.75 }}>
            Nilai ini menjadi ajakan hidup bersama untuk saling mengasihi: Somba Marhula-hula, Elek Marboru, dan
            Manat Mardongan Tubu pada parsadaan, raja, anak, boru, bere, dan ibebere di klan Simangunsong.
          </p>

          <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link
              href="/tarombo"
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: ".68rem",
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: C.hitam,
                background: `linear-gradient(135deg,${C.emas} 0%,${C.emasM} 50%,${C.emas} 100%)`,
                padding: "12px 22px",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Lihat Tarombo
            </Link>
            <Link
              href="/"
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: ".68rem",
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: C.emasM,
                border: `1px solid rgba(201,168,76,.45)`,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              Kembali Beranda
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
