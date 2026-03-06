"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PersonForm from "@/components/PersonForm";
import ComplexPersonForm from "@/components/ComplexPersonForm";
import Link from "next/link";

// ─── Palette ──────────────────────────────────────────────────────────────────
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

// ─── Dekorator ────────────────────────────────────────────────────────────────
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

// ─── Form Type Card ───────────────────────────────────────────────────────────
const FormTypeCard = ({
  active, icon, title, desc, onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="form-type-card"
    style={{
      flex: 1, minWidth: 0,
      padding: "18px 20px",
      border: `1px solid ${active ? C.emas : "rgba(201,168,76,0.15)"}`,
      background: active ? "rgba(139,26,26,0.22)" : "rgba(26,22,18,0.6)",
      cursor: "pointer",
      transition: "all .3s",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {active && (
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg,${C.merahTua},${C.emas},${C.merahTua})`,
      }}/>
    )}
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <span style={{ fontSize: "1.2rem", lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontFamily: "'Cinzel',serif", fontSize: "0.75rem",
          fontWeight: 700, color: active ? C.emasM : C.kremT,
          letterSpacing: "0.06em", marginBottom: 5,
        }}>{title}</p>
        <p style={{
          fontFamily: "'IM Fell English',serif", fontStyle: "italic",
          fontSize: "0.8rem", color: C.kremT, opacity: .6, lineHeight: 1.5,
        }}>{desc}</p>
      </div>
    </div>
    {active && (
      <div style={{
        position: "absolute", bottom: 8, right: 12,
        fontFamily: "'Cinzel',serif", fontSize: "0.5rem",
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: C.emas, opacity: .7,
      }}>Aktif ✓</div>
    )}
  </div>
);

// ─── Form Wrapper ─────────────────────────────────────────────────────────────
const FormWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    background: C.hitamL,
    border: `1px solid rgba(201,168,76,0.18)`,
    position: "relative",
    overflow: "hidden",
  }}>
    <div style={{
      height: 3,
      background: `linear-gradient(90deg,${C.merahTua},${C.emas},${C.merahTua})`,
    }}/>
    <div style={{
      position: "absolute", inset: 0, opacity: .025, pointerEvents: "none",
      backgroundImage: `repeating-linear-gradient(45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%)`,
      backgroundSize: "28px 28px",
    }}/>
    <div style={{ position: "relative", zIndex: 1 }}>
      {children}
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function TambahPage() {
  const router = useRouter();
  const [useComplexForm, setUseComplexForm] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  const handleSuccess = () => router.push("/admin");
  const handleCancel  = () => router.push("/admin");

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: C.hitam,
      color: C.krem,
      fontFamily: "'Cormorant Garamond',serif",
      position: "relative",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background-color: ${C.hitam}; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .fu  { opacity:0; animation:fadeUp .7s ease forwards; }
        .d1  { animation-delay:.1s; } .d2 { animation-delay:.2s; }
        .d3  { animation-delay:.3s; } .d4 { animation-delay:.4s; }

        .back-btn:hover  { color:${C.emas}!important; border-color:rgba(201,168,76,.4)!important; background:rgba(201,168,76,.05)!important; }
        .form-type-card:hover { border-color:rgba(201,168,76,.4)!important; }

        /* ─────────────────────────────────────────────────────────────────────
           FORM OVERRIDE — seluruh input/label/button di dalam .tambah-wrap
        ───────────────────────────────────────────────────────────────────── */
        .tambah-wrap input,
        .tambah-wrap textarea,
        .tambah-wrap select {
          background: rgba(13,11,8,0.85) !important;
          border: 1px solid rgba(201,168,76,0.22) !important;
          border-radius: 0 !important;
          color: ${C.kremT} !important;
          font-family: 'Cormorant Garamond', serif !important;
          font-size: 1rem !important;
          padding: 11px 14px !important;
          transition: border-color .2s, box-shadow .2s !important;
          outline: none !important;
          width: 100% !important;
          -webkit-appearance: none !important;
        }
        .tambah-wrap input:focus,
        .tambah-wrap textarea:focus,
        .tambah-wrap select:focus {
          border-color: ${C.emas} !important;
          box-shadow: 0 0 0 3px rgba(201,168,76,.07) !important;
        }
        .tambah-wrap input::placeholder,
        .tambah-wrap textarea::placeholder {
          color: rgba(232,217,184,0.28) !important;
          font-style: italic;
        }

        /* Labels */
        .tambah-wrap label {
          font-family: 'Cinzel', serif !important;
          font-size: 0.62rem !important;
          letter-spacing: 0.22em !important;
          text-transform: uppercase !important;
          color: ${C.emasT} !important;
          margin-bottom: 7px !important;
          display: block !important;
        }

        /* Submit button */
        .tambah-wrap button[type="submit"],
        .tambah-wrap button.btn-submit {
          font-family: 'Cinzel', serif !important;
          font-size: 0.7rem !important;
          letter-spacing: 0.2em !important;
          text-transform: uppercase !important;
          color: ${C.hitam} !important;
          font-weight: 600 !important;
          background: linear-gradient(135deg,${C.emas},${C.emasM},${C.emas}) !important;
          border: none !important;
          padding: 14px 36px !important;
          cursor: pointer !important;
          clip-path: polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%) !important;
          transition: all .3s !important;
          width: 100% !important;
          max-width: 320px !important;
        }
        .tambah-wrap button[type="submit"]:hover {
          box-shadow: 0 6px 24px rgba(201,168,76,.38) !important;
          transform: translateY(-1px) !important;
        }
        .tambah-wrap button[type="submit"]:disabled {
          opacity: .5 !important;
          cursor: not-allowed !important;
          transform: none !important;
        }

        /* Cancel button */
        .tambah-wrap button[type="button"].btn-cancel,
        .tambah-wrap button.btn-cancel {
          font-family: 'Cinzel', serif !important;
          font-size: 0.7rem !important;
          letter-spacing: 0.2em !important;
          text-transform: uppercase !important;
          color: ${C.emasT} !important;
          background: transparent !important;
          border: 1px solid rgba(201,168,76,.28) !important;
          padding: 14px 32px !important;
          cursor: pointer !important;
          clip-path: polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%) !important;
          transition: all .3s !important;
        }
        .tambah-wrap button.btn-cancel:hover {
          border-color: ${C.emas} !important;
          color: ${C.emas} !important;
        }

        /* Generic buttons inside form (tambah pasangan, dll) */
        .tambah-wrap button:not([type="submit"]):not(.btn-cancel) {
          font-family: 'Cinzel', serif !important;
          font-size: 0.62rem !important;
          letter-spacing: 0.14em !important;
          text-transform: uppercase !important;
          color: ${C.kremT} !important;
          background: rgba(201,168,76,.07) !important;
          border: 1px solid rgba(201,168,76,.2) !important;
          border-radius: 0 !important;
          padding: 9px 18px !important;
          cursor: pointer !important;
          transition: all .25s !important;
        }
        .tambah-wrap button:not([type="submit"]):not(.btn-cancel):hover {
          background: rgba(201,168,76,.13) !important;
          border-color: rgba(201,168,76,.4) !important;
          color: ${C.emas} !important;
        }

        /* Card / section backgrounds */
        .tambah-wrap .form-section,
        .tambah-wrap .bg-white,
        .tambah-wrap .bg-gray-50,
        .tambah-wrap [class*="bg-white"],
        .tambah-wrap [class*="rounded"],
        .tambah-wrap .card {
          background: rgba(17,14,9,0.75) !important;
          border: 1px solid rgba(201,168,76,.1) !important;
          border-radius: 0 !important;
        }

        /* Headings */
        .tambah-wrap h2,
        .tambah-wrap h3,
        .tambah-wrap h4 {
          font-family: 'Cinzel', serif !important;
          color: ${C.kremT} !important;
          letter-spacing: 0.05em !important;
        }

        /* Paragraphs & spans */
        .tambah-wrap p,
        .tambah-wrap span:not(button span) {
          font-family: 'Cormorant Garamond', serif !important;
        }

        /* Error */
        .tambah-wrap .text-red-500,
        .tambah-wrap .text-red-600,
        .tambah-wrap [class*="text-red"] {
          color: ${C.merahTerang} !important;
          font-family: 'Cinzel', serif !important;
          font-size: 0.62rem !important;
          letter-spacing: 0.1em !important;
        }

        /* Select option */
        .tambah-wrap select option {
          background: ${C.hitamL} !important;
          color: ${C.kremT} !important;
        }

        /* Dividers */
        .tambah-wrap hr {
          border: none !important;
          border-top: 1px solid rgba(201,168,76,.1) !important;
          margin: 20px 0 !important;
        }

        /* Radio / checkbox */
        .tambah-wrap input[type="radio"],
        .tambah-wrap input[type="checkbox"] {
          accent-color: ${C.emas} !important;
          width: auto !important;
          padding: 0 !important;
        }

        /* Scrollbar */
        .tambah-wrap ::-webkit-scrollbar       { width: 4px; }
        .tambah-wrap ::-webkit-scrollbar-track { background: ${C.hitam}; }
        .tambah-wrap ::-webkit-scrollbar-thumb { background: ${C.emasT}; border-radius: 2px; }

        /* Form padding (agar tidak terlalu rapat di HP) */
        .tambah-wrap > div > div { padding: 28px 28px !important; }

        /* ─── MOBILE ─────────────────────────────────────────────────────── */
        @media (max-width: 640px) {
          /* Page container */
          .page-container { padding: 20px 14px 64px !important; }

          /* Header */
          .page-header-title { font-size: clamp(1.4rem,6vw,2rem) !important; }
          .page-header-sub   { font-size: 0.88rem !important; }

          /* Form type selector — stack vertikal di HP */
          .form-type-row { flex-direction: column !important; gap: 8px !important; }

          /* Form padding lebih kecil */
          .tambah-wrap > div > div { padding: 20px 16px !important; }

          /* Input lebih touch-friendly */
          .tambah-wrap input,
          .tambah-wrap textarea,
          .tambah-wrap select {
            font-size: 16px !important; /* cegah auto-zoom iOS */
            padding: 13px 12px !important;
          }

          /* Label sedikit lebih kecil */
          .tambah-wrap label {
            font-size: 0.58rem !important;
            letter-spacing: 0.18em !important;
          }

          /* Submit & cancel full-width di mobile */
          .tambah-wrap button[type="submit"],
          .tambah-wrap button.btn-submit {
            max-width: 100% !important;
            padding: 14px 20px !important;
          }
          .tambah-wrap button[type="button"].btn-cancel,
          .tambah-wrap button.btn-cancel {
            padding: 12px 20px !important;
            width: 100% !important;
          }

          /* Back button */
          .back-btn { font-size: 0.58rem !important; padding: 9px 14px !important; }

          /* Side lines — sembunyikan di mobile, terlalu sempit */
          .side-line-left, .side-line-right { display: none !important; }

          /* Footer note */
          .footer-note { font-size: 0.78rem !important; padding: 0 4px; }
        }

        /* Tablet tweaks */
        @media (min-width: 641px) and (max-width: 900px) {
          .page-container { padding: 32px 28px 72px !important; }
          .tambah-wrap > div > div { padding: 28px 24px !important; }
        }
      `}</style>

      {/* Gorga background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, opacity: .035, pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%)`,
        backgroundSize: "28px 28px",
      }}/>

      {/* Loading State */}
      {loading && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.hitam,
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: `3px solid rgba(201,168,76,.2)`,
            borderTopColor: C.emas,
            borderRadius: "50%",
            animation: "spin .8s linear infinite",
          }}/>
        </div>
      )}

      {/* Main Content - Only show if authenticated */}
      {!loading && isAuthenticated && (
        <>
          {/* Side accent lines (hidden on mobile via class) */}
          <div className="side-line-left" style={{ position: "fixed", left: 0, top: 0, width: 3, height: "100%", background: `linear-gradient(to bottom,transparent,${C.merah} 20%,${C.merah} 80%,transparent)`, opacity: .45, zIndex: 1, pointerEvents: "none" }}/>
          <div className="side-line-right" style={{ position: "fixed", right: 0, top: 0, width: 3, height: "100%", background: `linear-gradient(to bottom,transparent,${C.merah} 20%,${C.merah} 80%,transparent)`, opacity: .45, zIndex: 1, pointerEvents: "none" }}/>

      <div className="page-container" style={{ position: "relative", zIndex: 2, maxWidth: 860, margin: "0 auto", padding: "44px 28px 88px" }}>

        {/* ── Back Button ── */}
        <div className="fu d1" style={{ marginBottom: 32 }}>
          <Link
            href="/admin"
            className="back-btn"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontFamily: "'Cinzel',serif", fontSize: "0.6rem",
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: C.emasT, textDecoration: "none",
              border: `1px solid rgba(201,168,76,.2)`,
              padding: "9px 18px", transition: "all .3s",
            }}
          >
            <svg width="11" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M5 1L1 5M1 5L5 9M1 5H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Kembali ke Beranda
          </Link>
        </div>

        {/* ── Page Header ── */}
        <div className="fu d2" style={{ textAlign: "center", marginBottom: 36 }}>
          <UlosStripe/>
          <p style={{
            fontFamily: "'Cinzel',serif", fontSize: "0.6rem",
            letterSpacing: "0.42em", textTransform: "uppercase",
            color: C.merahTerang, margin: "18px 0 10px",
          }}>
            Tarombo · Silsilah
          </p>
          <h1 className="page-header-title" style={{
            fontFamily: "'Cinzel Decorative',cursive",
            fontSize: "clamp(1.5rem,5vw,2.8rem)",
            fontWeight: 700, color: C.putih,
            textShadow: `0 0 40px rgba(201,168,76,.18)`,
            marginBottom: 10, lineHeight: 1.15,
          }}>
            Tambah <span style={{ color: C.emas }}>Anggota</span>
          </h1>
          <p className="page-header-sub" style={{
            fontFamily: "'IM Fell English',serif", fontStyle: "italic",
            fontSize: "0.95rem", color: C.kremT, opacity: .65,
            maxWidth: 400, margin: "0 auto",
          }}>
            Daftarkan anggota keluarga baru ke dalam silsilah Simangunsong
          </p>
        </div>

        {/* ── Form Type Selector ── */}
        <div className="fu d3" style={{ marginBottom: 24 }}>
          <p style={{
            fontFamily: "'Cinzel',serif", fontSize: "0.56rem",
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: C.emasT, marginBottom: 10, textAlign: "center",
          }}>
            Pilih Jenis Formulir
          </p>
          <div className="form-type-row" style={{ display: "flex", gap: 2 }}>
            <FormTypeCard
              active={useComplexForm}
              icon="📋"
              title="Form Lengkap"
              desc="Termasuk relasi keluarga — orang tua, pernikahan, dan anak"
              onClick={() => setUseComplexForm(true)}
            />
            <FormTypeCard
              active={!useComplexForm}
              icon="✏️"
              title="Form Sederhana"
              desc="Hanya data diri — nama, jenis kelamin, tanggal lahir, foto"
              onClick={() => setUseComplexForm(false)}
            />
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="fu d3" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,rgba(201,168,76,.18))` }}/>
          <div style={{ width: 5, height: 5, background: C.emas, transform: "rotate(45deg)", opacity: .55 }}/>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,rgba(201,168,76,.18),transparent)` }}/>
        </div>

        {/* ── Form ── */}
        <div className="fu d4 tambah-wrap">
          <FormWrapper>
            {useComplexForm
              ? <ComplexPersonForm onSuccess={handleSuccess} onCancel={handleCancel}/>
              : <PersonForm        onSuccess={handleSuccess} onCancel={handleCancel}/>
            }
          </FormWrapper>
        </div>

        {/* ── Footer note ── */}
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <p className="footer-note" style={{
            fontFamily: "'IM Fell English',serif", fontStyle: "italic",
            fontSize: "0.8rem", color: C.emasT, opacity: .55, lineHeight: 1.6,
          }}>
            Data yang ditambahkan akan langsung tersimpan<br/>dalam database silsilah Simangunsong
          </p>
        </div>

      </div>
      </>
      )}

      <UlosBorder/>
    </div>
  );
}