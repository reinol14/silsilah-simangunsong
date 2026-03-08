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

interface Admin {
  id: number;
  username: string;
  nama: string;
}

interface Stats {
  totalPerson: number;
  totalMarriage: number;
  totalAnak: number;
}

const UlosStripe = () => (
  <div style={{
    height: 4, width: 180, margin: "0 auto 24px",
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

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.success) {
        setAdmin(data.admin);
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

  async function loadStats() {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: C.hitam,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={{
          width: 40,
          height: 40,
          border: `3px solid rgba(201,168,76,.2)`,
          borderTopColor: C.emas,
          borderRadius: "50%",
          animation: "spin .8s linear infinite",
        }}/>
      </div>
    );
  }

  if (!admin) return null;

  const menuItems = [
    { href: "/tambah", label: "Tambah Anggota", icon: "👤", desc: "Daftarkan anggota baru ke silsilah" },
    { href: "/person", label: "Kelola Anggota", icon: "📋", desc: "Edit & hapus data anggota" },
    { href: "/tarombo", label: "Pohon Silsilah", icon: "🌳", desc: "Visualisasi tarombo keluarga" },
    { href: "/admin/urutan-anak", label: "Urutan Anak", icon: "🔢", desc: "Atur urutan anak ke-1, ke-2, dst dalam setiap pernikahan" },
    { href: "/admin/donatur", label: "Kelola Donatur", icon: "💛", desc: "Tambah & kelola data donatur yang ditampilkan di halaman depan" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: C.hitam,
      color: C.krem,
      fontFamily: "'Cormorant Garamond',serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .menu-card:hover { border-color: rgba(201,168,76,.35)!important; transform: translateY(-3px); }
        .btn-logout:hover { background: rgba(192,57,43,.2)!important; border-color: ${C.merahTerang}!important; }
        @media (max-width: 640px) {
          .adm-nav  { padding: 12px 16px !important; }
          .adm-logo { font-size: 0.75rem !important; }
          .adm-logo-sub { display: none !important; }
          .adm-nama { display: none !important; }
          .adm-wrap { padding: 32px 16px 64px !important; }
          .adm-title { font-size: clamp(1.6rem,7vw,2.2rem) !important; }
          .adm-stats { grid-template-columns: repeat(3, 1fr) !important; gap: 10px !important; }
          .adm-stat-val { font-size: 1.8rem !important; }
          .adm-menu  { grid-template-columns: 1fr !important; gap: 14px !important; }
          .menu-card { padding: 24px 20px !important; }
          .menu-icon { font-size: 2rem !important; margin-bottom: 10px !important; }
          .menu-label { font-size: 1rem !important; }
          .adm-info  { padding: 16px 18px !important; }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .adm-nav  { padding: 14px 24px !important; }
          .adm-wrap { padding: 48px 24px !important; }
          .adm-menu { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* Background pattern */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, opacity: .04, pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%)`,
        backgroundSize: "28px 28px",
      }}/>

      {/* Navbar */}
      <nav className="adm-nav" style={{
        padding: "18px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: `1px solid rgba(201,168,76,.15)`,
        position: "relative",
        zIndex: 10,
        background: C.hitamL,
      }}>
        <Link href="/" className="adm-logo" style={{
          fontFamily: "'Cinzel Decorative',cursive",
          fontSize: "0.95rem",
          color: C.emas,
          textDecoration: "none",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "60vw",
        }}>
          Silsilah <span className="adm-logo-sub" style={{ color: C.merahTerang }}>Simangunsong</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <span className="adm-nama" style={{
            fontFamily: "'Cinzel',serif",
            fontSize: "0.7rem",
            color: C.kremT,
            letterSpacing: "0.1em",
            whiteSpace: "nowrap",
          }}>
            {admin.nama}
          </span>
          <button
            onClick={handleLogout}
            className="btn-logout"
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.merahTerang,
              background: "transparent",
              border: `1px solid rgba(192,57,43,.3)`,
              padding: "10px 16px",
              cursor: "pointer",
              clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
              transition: "all .3s",
              minHeight: 44,
            }}
          >
            Keluar
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="adm-wrap" style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "60px 40px",
        position: "relative",
        zIndex: 10,
      }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <UlosStripe />
          <h1 className="adm-title" style={{
            fontFamily: "'Cinzel Decorative',cursive",
            fontSize: "clamp(1.8rem,5vw,2.5rem)",
            color: C.putih,
            marginBottom: 12,
          }}>
            Dashboard <span style={{ color: C.emas }}>Admin</span>
          </h1>
          <p style={{
            fontFamily: "'IM Fell English',serif",
            fontStyle: "italic",
            fontSize: "1rem",
            color: C.kremT,
            opacity: .7,
          }}>
            Kelola data silsilah Simangunsong
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="adm-stats" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 48,
          }}>
            {[
              { label: "Total Anggota", value: stats.totalPerson, color: C.emas },
              { label: "Pernikahan", value: stats.totalMarriage, color: "#7EB8D4" },
              { label: "Relasi Anak", value: stats.totalAnak, color: "#D4A0B5" },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: C.hitamL,
                  border: `1px solid rgba(201,168,76,.15)`,
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <div className="adm-stat-val" style={{
                  fontFamily: "'Cinzel Decorative',cursive",
                  fontSize: "2.5rem",
                  color: stat.color,
                  marginBottom: 8,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: C.kremT,
                  opacity: .7,
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Menu Grid */}
        <div className="adm-menu" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}>
          {menuItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="menu-card"
              style={{
                background: C.hitamL,
                border: `1px solid rgba(201,168,76,.15)`,
                padding: "32px 28px",
                textDecoration: "none",
                transition: "all .3s",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 3,
                background: `linear-gradient(90deg,${C.merahTua},${C.emas},${C.merahTua})`,
              }}/>
              <div className="menu-icon" style={{ fontSize: "2.6rem", marginBottom: 14 }}>
                {item.icon}
              </div>
              <h3 className="menu-label" style={{
                fontFamily: "'Cinzel',serif",
                fontSize: "1.1rem",
                color: C.putih,
                marginBottom: 8,
                letterSpacing: "0.05em",
              }}>
                {item.label}
              </h3>
              <p style={{
                fontFamily: "'IM Fell English',serif",
                fontStyle: "italic",
                fontSize: "0.95rem",
                color: C.kremT,
                opacity: .7,
                lineHeight: 1.5,
              }}>
                {item.desc}
              </p>
            </Link>
          ))}
        </div>

        {/* Info Box */}
        <div className="adm-info" style={{
          marginTop: 48,
          background: "rgba(139,26,26,.1)",
          border: `1px solid rgba(201,168,76,.15)`,
          padding: "24px 32px",
          textAlign: "center",
        }}>
          <p style={{
            fontFamily: "'IM Fell English',serif",
            fontStyle: "italic",
            fontSize: "0.95rem",
            color: C.kremT,
            opacity: .7,
            lineHeight: 1.7,
          }}>
            Sebagai administrator, Anda memiliki akses penuh untuk mengelola data silsilah. 
            Pastikan data yang dimasukkan akurat dan lengkap untuk menjaga integritas arsip keluarga.
          </p>
        </div>
      </div>

      <UlosBorder />
    </div>
  );
}
