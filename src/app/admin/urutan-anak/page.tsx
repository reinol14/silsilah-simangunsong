"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const C = {
  merah:       "#8B1A1A",
  merahTua:    "#5C0E0E",
  merahTerang: "#C0392B",
  emas:        "#C9A84C",
  emasM:       "#E8CC7A",
  emasT:       "#8B6914",
  hitam:       "#0D0B08",
  hitamL:      "#1A1612",
  krem:        "#F5EDD8",
  kremT:       "#E8D9B8",
  putih:       "#FDF8EE",
};

const UlosStripe = () => (
  <div style={{
    height: 4, width: 180, margin: "0 auto",
    background: `repeating-linear-gradient(90deg,
      ${C.merah} 0px,${C.merah} 14px,
      ${C.emas}  14px,${C.emas}  20px,
      ${C.hitam} 20px,${C.hitam} 26px,
      ${C.emas}  26px,${C.emas}  32px,
      ${C.merah} 32px,${C.merah} 46px,
      ${C.hitam} 46px,${C.hitam} 50px)`,
  }}/>
);

const UlosBorder = () => (
  <div style={{
    height: 6, width: "100%",
    background: `repeating-linear-gradient(90deg,
      ${C.merahTua} 0px,${C.merahTua} 20px,
      ${C.emasT}    20px,${C.emasT}    28px,
      ${C.hitam}    28px,${C.hitam}    36px,
      ${C.emasT}    36px,${C.emasT}    44px,
      ${C.merahTua} 44px,${C.merahTua} 64px,
      ${C.hitam}    64px,${C.hitam}    68px)`,
  }}/>
);

interface ChildInfo {
  id: number;
  urutanAnak: number | null;
  person: { id: number; nama: string };
}

interface MarriageItem {
  id: number;
  husband: { id: number; nama: string };
  wife:    { id: number; nama: string };
  children: ChildInfo[];
}

export default function UrutanAnakListPage() {
  const router   = useRouter();
  const [marriages, setMarriages] = useState<MarriageItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    try {
      const authRes = await fetch("/api/auth/me");
      const auth    = await authRes.json();
      if (!auth.success) { router.push("/login"); return; }
      const res  = await fetch("/api/marriage");
      const data = await res.json();
      if (data.success) setMarriages(data.data);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  const filtered = marriages.filter(m => {
    const q = search.toLowerCase();
    return (
      m.husband.nama.toLowerCase().includes(q) ||
      m.wife.nama.toLowerCase().includes(q)
    );
  }).filter(m => m.children.length > 0); // hanya pernikahan yg punya anak

  function urutanStatus(children: ChildInfo[]) {
    const hasUrutan = children.filter(c => c.urutanAnak !== null).length;
    if (hasUrutan === 0) return { label: "Belum diatur", color: "rgba(201,168,76,.4)" };
    if (hasUrutan < children.length) return { label: `${hasUrutan}/${children.length} diatur`, color: C.merahTerang };
    return { label: "Lengkap", color: "#7EC87E" };
  }

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:C.hitam, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:40, height:40, border:`3px solid rgba(201,168,76,.2)`, borderTopColor:C.emas, borderRadius:"50%", animation:"spin .8s linear infinite" }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:C.hitam, color:C.krem, fontFamily:"'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fu { opacity:0; animation:fadeUp .6s ease forwards; }
        .d1 { animation-delay:.1s; } .d2 { animation-delay:.2s; } .d3 { animation-delay:.25s; }
        .back-btn:hover { color:${C.emas}!important; border-color:rgba(201,168,76,.4)!important; }
        .marriage-card:hover { border-color:rgba(201,168,76,.4)!important; background:rgba(26,22,18,.9)!important; }
        input:focus { border-color:${C.emas}!important; box-shadow:0 0 0 3px rgba(201,168,76,.07)!important; }
        @media (max-width: 640px) {
          .ual-wrap { padding: 28px 14px 72px !important; }
          .ual-back { font-size: 0.65rem !important; padding: 10px 14px !important; }
          .marriage-card { padding: 12px 14px !important; gap: 10px !important; }
          .mc-icon  { width: 36px !important; height: 36px !important; font-size: 0.95rem !important; flex-shrink: 0; }
          .mc-name  { font-size: 0.82rem !important; }
          .mc-sub   { font-size: 0.74rem !important; }
          .mc-badge { font-size: 0.5rem !important; padding: 3px 8px !important; }
          input[type="text"] { font-size: 16px !important; }
        }
      `}</style>

      <div style={{ position:"fixed", inset:0, zIndex:0, opacity:.035, pointerEvents:"none",
        backgroundImage:`repeating-linear-gradient(45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%)`,
        backgroundSize:"28px 28px" }}/>

      <div className="ual-wrap" style={{ position:"relative", zIndex:1, maxWidth:760, margin:"0 auto", padding:"44px 24px 88px" }}>

        {/* Back */}
        <div className="fu d1" style={{ marginBottom:32 }}>
          <Link href="/admin" className="back-btn" style={{
            display:"inline-flex", alignItems:"center", gap:10,
            fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase",
            color:C.emasT, textDecoration:"none", border:`1px solid rgba(201,168,76,.2)`, padding:"9px 18px", transition:"all .3s",
          }}>
            <svg width="11" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M5 1L1 5M1 5L5 9M1 5H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Kembali ke Admin
          </Link>
        </div>

        {/* Header */}
        <div className="fu d1" style={{ textAlign:"center", marginBottom:36 }}>
          <UlosStripe/>
          <p style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.42em", textTransform:"uppercase", color:C.merahTerang, margin:"18px 0 10px" }}>
            Kelola · Silsilah
          </p>
          <h1 style={{ fontFamily:"'Cinzel Decorative',cursive", fontSize:"clamp(1.4rem,4vw,2.2rem)", fontWeight:700, color:C.putih, marginBottom:10, lineHeight:1.2 }}>
            Urutan <span style={{ color:C.emas }}>Anak</span>
          </h1>
          <p style={{ fontFamily:"'IM Fell English',serif", fontStyle:"italic", fontSize:"0.95rem", color:C.kremT, opacity:.65 }}>
            Pilih pasangan untuk mengatur urutan anak-anak mereka
          </p>
        </div>

        {/* Search */}
        <div className="fu d2" style={{ marginBottom:24 }}>
          <input
            type="text"
            placeholder="Cari nama suami atau istri..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width:"100%", background:"rgba(13,11,8,.85)", border:`1px solid rgba(201,168,76,.22)`,
              color:C.kremT, fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem",
              padding:"11px 16px", outline:"none", transition:"border-color .2s, box-shadow .2s",
            }}
          />
        </div>

        {/* Info */}
        <div className="fu d2" style={{ marginBottom:20 }}>
          <p style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", color:C.emasT }}>
            {filtered.length} Pasangan dengan Anak
          </p>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="fu d3" style={{ textAlign:"center", padding:"48px 0", color:C.emasT, fontFamily:"'Cinzel',serif", fontSize:"0.7rem", letterSpacing:"0.2em" }}>
            {search ? "TIDAK ADA HASIL" : "BELUM ADA DATA PERNIKAHAN DENGAN ANAK"}
          </div>
        ) : (
          <div className="fu d3" style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filtered.map(m => {
              const status = urutanStatus(m.children);
              return (
                <Link
                  key={m.id}
                  href={`/admin/urutan-anak/${m.id}`}
                  className="marriage-card"
                  style={{
                    display:"flex", alignItems:"center", gap:16,
                    background:C.hitamL, border:`1px solid rgba(201,168,76,.15)`,
                    padding:"16px 20px", textDecoration:"none", transition:"all .25s",
                  }}
                >
                  {/* Icon */}
                  <div className="mc-icon" style={{
                    width:42, height:42, display:"flex", alignItems:"center", justifyContent:"center",
                    background:"rgba(139,26,26,.3)", border:`1px solid rgba(201,168,76,.2)`,
                    fontFamily:"'Cinzel Decorative',cursive", fontSize:"1.1rem", color:C.emas, flexShrink:0,
                  }}>
                    ♦
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p className="mc-name" style={{ fontFamily:"'Cinzel',serif", fontSize:"0.85rem", color:C.putih, fontWeight:600, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {m.husband.nama}
                      <span style={{ color:C.emasT, margin:"0 6px", fontWeight:400 }}>&</span>
                      {m.wife.nama}
                    </p>
                    <p className="mc-sub" style={{ fontFamily:"'IM Fell English',serif", fontStyle:"italic", fontSize:"0.78rem", color:C.emasT, opacity:.8, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {m.children.length} anak
                      {" · "}
                      {m.children.slice(0,2).map(c => c.person.nama).join(", ")}
                      {m.children.length > 2 ? "..." : ""}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="mc-badge" style={{
                    fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.12em", textTransform:"uppercase",
                    color:status.color, border:`1px solid ${status.color}`, padding:"4px 10px", flexShrink:0,
                    opacity:.9, whiteSpace:"nowrap",
                  }}>
                    {status.label}
                  </div>

                  {/* Arrow */}
                  <svg width="11" height="10" viewBox="0 0 12 10" fill="none" style={{ flexShrink:0, opacity:.4 }}>
                    <path d="M7 1L11 5M11 5L7 9M11 5H1" stroke={C.emas} strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <UlosBorder/>
    </div>
  );
}
