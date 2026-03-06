"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  kremT:       "#E8D9B8",
  putih:       "#FDF8EE",
  biru:        "#7EB8D4",
  pink:        "#D4A0B5",
};

interface SearchResult {
  id:           number;
  nama:         string;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
  foto:         string | null;
  tanggalLahir: string | null;
  tanggalWafat: string | null;
  tempatLahir:  string | null;
  namaOrangTua: string | null;
  namaPasangan: string | null;
}

const UlosBorder = () => (
  <div style={{
    height: 4, width: "100%",
    background: `repeating-linear-gradient(90deg,
      ${C.merahTua} 0px,${C.merahTua} 20px,
      ${C.emasT}    20px,${C.emasT}    28px,
      ${C.hitam}    28px,${C.hitam}    36px,
      ${C.emasT}    36px,${C.emasT}    44px,
      ${C.merahTua} 44px,${C.merahTua} 64px,
      ${C.hitam}    64px,${C.hitam}    68px)`,
  }}/>
);

function ResultCard({ p }: { p: SearchResult }) {
  const isLaki = p.jenisKelamin === "LAKI_LAKI";
  const acc    = isLaki ? C.biru : C.pink;
  const tahunLahir = p.tanggalLahir ? new Date(p.tanggalLahir).getFullYear() : null;
  const tahunWafat = p.tanggalWafat ? new Date(p.tanggalWafat).getFullYear() : null;

  return (
    <Link
      href={`/profil/${p.id}`}
      style={{
        display: "block",
        textDecoration: "none",
        background: C.hitamL,
        border: `1px solid rgba(201,168,76,.18)`,
        borderLeft: `3px solid ${acc}`,
        padding: "16px 20px",
        transition: "all .25s",
        position: "relative",
        overflow: "hidden",
      }}
      className="result-card"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Avatar */}
        <div style={{
          width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
          background: `linear-gradient(135deg,${C.merahTua},${C.hitam})`,
          border: `2px solid ${acc}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {p.foto
            ? <img src={p.foto} alt={p.nama} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
            : <span style={{ fontFamily: "'Cinzel Decorative',cursive", fontSize: "1rem", color: acc }}>
                {p.nama.charAt(0)}
              </span>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "'Cinzel',serif", fontSize: "0.95rem", fontWeight: 600,
            color: C.putih, margin: 0, marginBottom: 3,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {p.nama}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: acc }}>
              {isLaki ? "Laki-laki" : "Perempuan"}
            </span>
            {(tahunLahir || p.tempatLahir) && (
              <span style={{ fontFamily: "'IM Fell English',serif", fontStyle: "italic", fontSize: "0.78rem", color: C.kremT, opacity: .75 }}>
                {p.tempatLahir && `${p.tempatLahir}`}{tahunLahir && `, ${tahunLahir}`}{tahunWafat && ` – ${tahunWafat}`}
              </span>
            )}
          </div>
          {p.namaOrangTua && (
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.78rem", color: C.emasT, margin: "3px 0 0" }}>
              Anak dari: <span style={{ color: C.kremT, opacity: .8 }}>{p.namaOrangTua}</span>
            </p>
          )}
          {p.namaPasangan && (
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.78rem", color: C.emasT, margin: "2px 0 0" }}>
              {isLaki ? "Istri" : "Suami"}: <span style={{ color: acc, opacity: .85 }}>{p.namaPasangan}</span>
            </p>
          )}
        </div>

        {/* Arrow */}
        <span style={{ color: C.emasT, fontSize: "1rem", flexShrink: 0, opacity: .6 }}>›</span>
      </div>
    </Link>
  );
}

export default function CariPage() {
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<SearchResult[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef   = useRef<HTMLInputElement>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout>|null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/person/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (data.success) { setResults(data.data); setSearched(true); }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query), 350);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, doSearch]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.hitam, color: C.kremT, fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .result-card:hover { border-color: rgba(201,168,76,.4)!important; background: rgba(30,26,20,1)!important; transform: translateX(3px); }
        .search-inp:focus { border-color: rgba(201,168,76,.55)!important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Background pattern */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, opacity: .03, pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%)`,
        backgroundSize: "28px 28px",
      }}/>

      {/* Navbar */}
      <nav style={{
        padding: "18px 48px", display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid rgba(201,168,76,.12)`, background: C.hitamL,
        position: "relative", zIndex: 10,
      }}>
        <Link href="/" style={{ fontFamily: "'Cinzel Decorative',cursive", fontSize: "1rem", color: C.emas, textDecoration: "none" }}>
          Silsilah <span style={{ color: C.merahTerang }}>Simangunsong</span>
        </Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link href="/tarombo" style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.kremT, textDecoration: "none", opacity: .7 }}>
            Pohon Silsilah
          </Link>
          <Link href="/person"  style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.kremT, textDecoration: "none", opacity: .7 }}>
            Daftar Anggota
          </Link>
        </div>
      </nav>

      {/* Main */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 80px", position: "relative", zIndex: 10 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", color: C.emasT, marginBottom: 14 }}>
            Pencarian Anggota
          </p>
          <h1 style={{ fontFamily: "'Cinzel Decorative',cursive", fontSize: "clamp(1.6rem,4vw,2.4rem)", color: C.putih, marginBottom: 10, lineHeight: 1.3 }}>
            Cari <span style={{ color: C.emas }}>Keluarga</span>
          </h1>
          <p style={{ fontFamily: "'IM Fell English',serif", fontStyle: "italic", fontSize: "1rem", color: C.kremT, opacity: .65 }}>
            Temukan anggota keluarga Simangunsong berdasarkan nama atau tempat lahir
          </p>
        </div>

        {/* Search Box */}
        <div style={{ position: "relative", marginBottom: 32 }}>
          <div style={{
            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
            width: 18, height: 18, opacity: .5, pointerEvents: "none",
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={C.emas} strokeWidth="2">
              <circle cx="11" cy="11" r="7"/>
              <line x1="16.5" y1="16.5" x2="22" y2="22"/>
            </svg>
          </div>
          <input
            ref={inputRef}
            className="search-inp"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ketik nama atau tempat lahir..."
            style={{
              width: "100%",
              padding: "16px 48px 16px 46px",
              background: "rgba(26,22,18,.95)",
              border: `1px solid rgba(201,168,76,.25)`,
              color: C.kremT,
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "1.05rem",
              outline: "none",
              transition: "border-color .2s",
              letterSpacing: "0.02em",
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults([]); setSearched(false); inputRef.current?.focus(); }}
              style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: C.emasT, cursor: "pointer",
                fontSize: "1.2rem", lineHeight: 1, padding: "4px 6px",
              }}
            >×</button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
            <div style={{
              width: 28, height: 28,
              border: `2px solid rgba(201,168,76,.2)`,
              borderTopColor: C.emas,
              borderRadius: "50%",
              animation: "spin .8s linear infinite",
            }}/>
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <p style={{
              fontFamily: "'Cinzel',serif", fontSize: "0.55rem", letterSpacing: "0.25em",
              textTransform: "uppercase", color: C.emasT, marginBottom: 16, opacity: .8,
            }}>
              {results.length > 0
                ? `${results.length} anggota ditemukan`
                : "Tidak ada hasil"
              }
            </p>

            {results.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {results.map(p => <ResultCard key={p.id} p={p}/>)}
              </div>
            ) : (
              <div style={{
                textAlign: "center", padding: "48px 24px",
                border: `1px solid rgba(201,168,76,.1)`,
                background: "rgba(26,22,18,.5)",
              }}>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.75rem", letterSpacing: "0.2em", color: C.emasT, marginBottom: 10 }}>
                  Tidak Ditemukan
                </p>
                <p style={{ fontFamily: "'IM Fell English',serif", fontStyle: "italic", fontSize: "0.95rem", color: C.kremT, opacity: .6 }}>
                  Coba kata kunci lain, atau lihat seluruh anggota
                </p>
                <Link href="/person" style={{
                  display: "inline-block", marginTop: 20,
                  fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
                  color: C.emas, textDecoration: "none",
                  border: `1px solid rgba(201,168,76,.35)`, padding: "10px 24px",
                }}>
                  Lihat Semua Anggota
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Empty state — belum search */}
        {!loading && !searched && (
          <div style={{ textAlign: "center", padding: "48px 0", opacity: .45 }}>
            <div style={{ width: 48, height: 48, margin: "0 auto 16px" }}>
              <svg viewBox="0 0 48 48" fill="none" stroke={C.emas} strokeWidth="1.2">
                <circle cx="20" cy="20" r="12"/>
                <line x1="29" y1="29" x2="44" y2="44"/>
              </svg>
            </div>
            <p style={{ fontFamily: "'IM Fell English',serif", fontStyle: "italic", fontSize: "0.95rem", color: C.kremT }}>
              Ketik minimal 2 huruf untuk mulai mencari
            </p>
          </div>
        )}
      </div>

      <UlosBorder/>
    </div>
  );
}
