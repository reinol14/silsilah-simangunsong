"use client";

import { useState, FormEvent } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Login gagal");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: C.hitam,
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Cormorant Garamond',serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 480px) {
          .lgn-nav  { padding: 12px 16px !important; }
          .lgn-logo { font-size: 0.78rem !important; }
          .lgn-logo-sub { display: none !important; }
          .lgn-card-pad { padding: 32px 20px !important; }
          .lgn-title { font-size: 1.6rem !important; }
          .lgn-inp  { font-size: 16px !important; }
          .lgn-btn  { min-height: 48px; font-size: 0.78rem !important; }
          .lgn-back { font-size: 0.68rem !important; padding: 10px 14px !important; }
        }
      `}</style>

      {/* Background pattern */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, opacity: .04, pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%)`,
        backgroundSize: "28px 28px",
      }}/>

      {/* Navbar */}
      <nav className="lgn-nav" style={{
        padding: "16px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: `1px solid rgba(201,168,76,.15)`,
        position: "relative",
        zIndex: 10,
      }}>
        <Link href="/" className="lgn-logo" style={{
          fontFamily: "'Cinzel Decorative',cursive",
          fontSize: "0.95rem",
          color: C.emas,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}>
          Silsilah <span className="lgn-logo-sub" style={{ color: C.merahTerang }}>Simangunsong</span>
        </Link>
        <Link href="/" className="lgn-back" style={{
          fontFamily: "'Cinzel',serif",
          fontSize: "0.65rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: C.kremT,
          textDecoration: "none",
          transition: "color .3s",
          padding: "10px 0",
          whiteSpace: "nowrap",
        }}>
          ← Kembali
        </Link>
      </nav>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: 420,
          width: "100%",
          background: C.hitamL,
          border: `1px solid rgba(201,168,76,.25)`,
          position: "relative",
        }}>
          {/* Top accent */}
          <div style={{
            height: 3,
            background: `linear-gradient(90deg,${C.merahTua},${C.emas},${C.merahTua})`,
          }}/>

          <div className="lgn-card-pad" style={{ padding: "44px 36px" }}>
            <UlosStripe />

            <h1 className="lgn-title" style={{
              fontFamily: "'Cinzel Decorative',cursive",
              fontSize: "2rem",
              color: C.putih,
              textAlign: "center",
              marginBottom: 8,
            }}>
              Login <span style={{ color: C.emas }}>Admin</span>
            </h1>
            
            <p style={{
              fontFamily: "'IM Fell English',serif",
              fontStyle: "italic",
              fontSize: "0.95rem",
              color: C.kremT,
              opacity: .7,
              textAlign: "center",
              marginBottom: 36,
            }}>
              Masuk untuk mengelola data silsilah
            </p>

            {error && (
              <div style={{
                background: "rgba(192,57,43,.15)",
                border: `1px solid rgba(192,57,43,.4)`,
                padding: "12px 16px",
                marginBottom: 20,
                borderRadius: 4,
              }}>
                <p style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: "0.8rem",
                  color: C.merahTerang,
                  textAlign: "center",
                }}>
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block",
                  fontFamily: "'Cinzel',serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: C.emasT,
                  marginBottom: 8,
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="lgn-inp"
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: "1rem",
                    color: C.putih,
                    background: "rgba(13,11,8,.6)",
                    border: `1px solid rgba(201,168,76,.2)`,
                    outline: "none",
                    transition: "border-color .3s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.emas}
                  onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,.2)"}
                />
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{
                  display: "block",
                  fontFamily: "'Cinzel',serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: C.emasT,
                  marginBottom: 8,
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="lgn-inp"
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: "1rem",
                    color: C.putih,
                    background: "rgba(13,11,8,.6)",
                    border: `1px solid rgba(201,168,76,.2)`,
                    outline: "none",
                    transition: "border-color .3s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.emas}
                  onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,.2)"}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="lgn-btn"
                style={{
                  width: "100%",
                  fontFamily: "'Cinzel',serif",
                  fontSize: "0.72rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: C.hitam,
                  fontWeight: 600,
                  background: loading
                    ? "rgba(201,168,76,.5)"
                    : `linear-gradient(135deg,${C.emas} 0%,${C.emasM} 50%,${C.emas} 100%)`,
                  padding: "16px",
                  border: "none",
                  clipPath: "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all .3s",
                  opacity: loading ? 0.7 : 1,
                  minHeight: 48,
                }}
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <div style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: `1px solid rgba(201,168,76,.1)`,
              textAlign: "center",
            }}>
              <p style={{
                fontFamily: "'IM Fell English',serif",
                fontStyle: "italic",
                fontSize: "0.85rem",
                color: C.kremT,
                opacity: .5,
              }}>
                Hanya untuk administrator silsilah
              </p>
            </div>
          </div>
        </div>
      </div>

      <UlosBorder />
    </div>
  );
}
