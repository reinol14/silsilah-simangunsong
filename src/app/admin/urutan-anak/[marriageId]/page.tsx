"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  hitamM:      "#111009",
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

interface ChildItem {
  id: number;
  urutanAnak: number | null;
  person: {
    id: number;
    nama: string;
    jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
    tanggalLahir: string | null;
  };
}

interface MarriageData {
  id: number;
  husband: { id: number; nama: string };
  wife:    { id: number; nama: string };
  children: ChildItem[];
}

function toRoman(n: number): string {
  const vals = [10,9,5,4,1];
  const syms = ["X","IX","V","IV","I"];
  let r = "";
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { r += syms[i]; n -= vals[i]; }
  }
  return r;
}

export default function UrutanAnakPage() {
  const params  = useParams();
  const router  = useRouter();
  const mId     = params.marriageId as string;

  const [marriage, setMarriage] = useState<MarriageData | null>(null);
  const [items, setItems]       = useState<ChildItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    checkAuthAndLoad();
  }, [mId]);

  async function checkAuthAndLoad() {
    try {
      const authRes = await fetch("/api/auth/me");
      const auth    = await authRes.json();
      if (!auth.success) { router.push("/login"); return; }
      await loadData();
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function loadData() {
    const res  = await fetch(`/api/marriage/${mId}/urutan-anak`);
    const data = await res.json();
    if (!data.success) { setError("Data tidak ditemukan"); return; }
    setMarriage(data.data);
    // Sort by existing urutan, then id
    const sorted = [...data.data.children].sort((a: ChildItem, b: ChildItem) => {
      if (a.urutanAnak !== null && b.urutanAnak !== null) return a.urutanAnak - b.urutanAnak;
      if (a.urutanAnak !== null) return -1;
      if (b.urutanAnak !== null) return 1;
      return a.id - b.id;
    });
    setItems(sorted);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    setItems(prev => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
    setSaved(false);
  }

  function moveDown(idx: number) {
    if (idx === items.length - 1) return;
    setItems(prev => {
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const updates = items.map((item, idx) => ({
        childId:    item.id,
        urutanAnak: idx + 1,
      }));
      const res  = await fetch(`/api/marriage/${mId}/urutan-anak`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body:   JSON.stringify(updates),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || "Gagal menyimpan"); return; }
      // Update local urutan numbers
      setItems(prev => prev.map((item, idx) => ({ ...item, urutanAnak: idx + 1 })));
      setSaved(true);
    } catch {
      setError("Gagal menyimpan urutan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.hitam, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: `3px solid rgba(201,168,76,.2)`, borderTopColor: C.emas, borderRadius: "50%", animation: "spin .8s linear infinite" }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.hitam, color: C.krem, fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fu { opacity:0; animation: fadeUp .6s ease forwards; }
        .d1 { animation-delay:.1s; } .d2 { animation-delay:.2s; } .d3 { animation-delay:.3s; }
        .back-btn:hover { color:${C.emas}!important; border-color:rgba(201,168,76,.4)!important; }
        .child-card:hover { border-color:rgba(201,168,76,.35)!important; }
        .move-btn:hover { background:rgba(201,168,76,.15)!important; color:${C.emas}!important; }
        .save-btn:hover { box-shadow: 0 6px 24px rgba(201,168,76,.38)!important; transform:translateY(-1px)!important; }
        .save-btn:disabled { opacity:.5!important; cursor:not-allowed!important; transform:none!important; }
        @media (max-width: 640px) {
          .ua-wrap { padding: 28px 14px 72px !important; }
          .ua-back  { font-size: 0.65rem !important; padding: 10px 14px !important; }
          .ua-card  { padding: 12px 14px !important; gap: 10px !important; }
          .ua-num   { min-width: 40px !important; height: 40px !important; }
          .move-btn { width: 44px !important; height: 44px !important; font-size: 1.2rem !important; }
          .ua-name  { font-size: 0.92rem !important; }
          .ua-sub   { font-size: 0.8rem !important; }
          .ua-save  { padding: 16px 36px !important; font-size: 0.72rem !important; }
        }
      `}</style>

      {/* Gorga bg */}
      <div style={{ position:"fixed", inset:0, zIndex:0, opacity:.035, pointerEvents:"none",
        backgroundImage:`repeating-linear-gradient(45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%)`,
        backgroundSize:"28px 28px" }}/>

      <div className="ua-wrap" style={{ position:"relative", zIndex:1, maxWidth:700, margin:"0 auto", padding:"44px 24px 88px" }}>

        {/* Back */}
        <div className="fu d1" style={{ marginBottom:32 }}>
          <Link href="/admin/urutan-anak" className="back-btn" style={{
            display:"inline-flex", alignItems:"center", gap:10,
            fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase",
            color:C.emasT, textDecoration:"none", border:`1px solid rgba(201,168,76,.2)`, padding:"9px 18px", transition:"all .3s",
          }}>
            <svg width="11" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M5 1L1 5M1 5L5 9M1 5H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Kembali ke Daftar
          </Link>
        </div>

        {/* Header */}
        <div className="fu d1" style={{ textAlign:"center", marginBottom:36 }}>
          <UlosStripe/>
          <p style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.42em", textTransform:"uppercase", color:C.merahTerang, margin:"18px 0 10px" }}>
            Kelola · Urutan Anak
          </p>
          <h1 style={{ fontFamily:"'Cinzel Decorative',cursive", fontSize:"clamp(1.4rem,4vw,2.2rem)", fontWeight:700, color:C.putih, marginBottom:10, lineHeight:1.2 }}>
            Urutan <span style={{ color:C.emas }}>Anak</span>
          </h1>
          {marriage && (
            <p style={{ fontFamily:"'IM Fell English',serif", fontStyle:"italic", fontSize:"1rem", color:C.kremT, opacity:.7 }}>
              {marriage.husband.nama} &amp; {marriage.wife.nama}
            </p>
          )}
        </div>

        {error && (
          <div className="fu d2" style={{ background:"rgba(139,26,26,.25)", border:`1px solid rgba(192,57,43,.5)`, padding:"12px 16px", marginBottom:20, fontFamily:"'Cinzel',serif", fontSize:"0.7rem", color:C.merahTerang, letterSpacing:"0.08em" }}>
            {error}
          </div>
        )}

        {saved && (
          <div className="fu d2" style={{ background:"rgba(26,100,26,.25)", border:`1px solid rgba(76,168,76,.3)`, padding:"12px 16px", marginBottom:20, fontFamily:"'Cinzel',serif", fontSize:"0.7rem", color:"#7EC87E", letterSpacing:"0.08em" }}>
            Urutan berhasil disimpan
          </div>
        )}

        {/* Instruksi */}
        <div className="fu d2" style={{ background:"rgba(201,168,76,.06)", border:`1px solid rgba(201,168,76,.15)`, padding:"14px 18px", marginBottom:28 }}>
          <p style={{ fontFamily:"'IM Fell English',serif", fontStyle:"italic", fontSize:"0.9rem", color:C.kremT, opacity:.75, lineHeight:1.6 }}>
            Geser posisi anak menggunakan tombol ↑ ↓, lalu klik <strong style={{ color:C.emas, fontStyle:"normal" }}>Simpan Urutan</strong> untuk menyimpan perubahan.
            Urutan ini akan mempengaruhi tampilan di pohon silsilah.
          </p>
        </div>

        {/* Daftar anak */}
        {items.length === 0 ? (
          <div className="fu d3" style={{ textAlign:"center", padding:"48px 0", color:C.emasT, fontFamily:"'Cinzel',serif", fontSize:"0.7rem", letterSpacing:"0.2em" }}>
            BELUM ADA ANAK DALAM PERNIKAHAN INI
          </div>
        ) : (
          <div className="fu d3" style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {items.map((item, idx) => {
              const tahunLahir = item.person.tanggalLahir
                ? new Date(item.person.tanggalLahir).getFullYear()
                : null;
              const isLaki = item.person.jenisKelamin === "LAKI_LAKI";
              return (
                <div
                  key={item.id}
                  className="child-card ua-card"
                  style={{
                    display:"flex", alignItems:"center", gap:14,
                    background:C.hitamL, border:`1px solid rgba(201,168,76,.15)`,
                    padding:"14px 18px", transition:"border-color .2s",
                  }}
                >
                  {/* Nomor urut */}
                  <div className="ua-num" style={{
                    minWidth:46, height:46, display:"flex", alignItems:"center", justifyContent:"center",
                    background:"rgba(139,26,26,.35)", border:`1px solid rgba(201,168,76,.3)`,
                    fontFamily:"'Cinzel Decorative',cursive", fontSize:"1rem", color:C.emas, fontWeight:700,
                    flexShrink:0,
                  }}>
                    {idx + 1}
                  </div>

                  {/* Info anak */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p className="ua-name" style={{ fontFamily:"'Cinzel',serif", fontSize:"0.85rem", color:C.putih, fontWeight:600, marginBottom:3 }}>
                      {item.person.nama}
                    </p>
                    <p className="ua-sub" style={{ fontFamily:"'IM Fell English',serif", fontStyle:"italic", fontSize:"0.78rem", color:C.emasT, opacity:.8 }}>
                      {isLaki ? "Laki-laki" : "Perempuan"}
                      {tahunLahir ? ` · ${tahunLahir}` : ""}
                      {item.urutanAnak ? ` · Anak ke-${item.urutanAnak}` : " · Belum tersimpan"}
                    </p>
                  </div>

                  {/* Tombol geser */}
                  <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="move-btn"
                      style={{
                        width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center",
                        background:"rgba(201,168,76,.08)", border:`1px solid rgba(201,168,76,.2)`,
                        color:idx === 0 ? "rgba(201,168,76,.25)" : C.kremT, cursor:idx === 0 ? "not-allowed" : "pointer",
                        fontSize:"1.1rem", transition:"all .2s",
                      }}
                      title="Naik"
                    >↑</button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === items.length - 1}
                      className="move-btn"
                      style={{
                        width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center",
                        background:"rgba(201,168,76,.08)", border:`1px solid rgba(201,168,76,.2)`,
                        color:idx === items.length - 1 ? "rgba(201,168,76,.25)" : C.kremT, cursor:idx === items.length - 1 ? "not-allowed" : "pointer",
                        fontSize:"1.1rem", transition:"all .2s",
                      }}
                      title="Turun"
                    >↓</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tombol simpan */}
        {items.length > 0 && (
          <div style={{ marginTop:32, display:"flex", justifyContent:"center" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="save-btn"
              style={{
                fontFamily:"'Cinzel',serif", fontSize:"0.7rem", letterSpacing:"0.2em", textTransform:"uppercase",
                color:C.hitam, fontWeight:600,
                background:`linear-gradient(135deg,${C.emas},${C.emasM},${C.emas})`,
                border:"none", padding:"14px 48px", cursor:saving ? "not-allowed" : "pointer",
                clipPath:"polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                transition:"all .3s",
              }}
            >
              {saving ? "Menyimpan..." : "Simpan Urutan"}
            </button>
          </div>
        )}

      </div>
      <UlosBorder/>
    </div>
  );
}
