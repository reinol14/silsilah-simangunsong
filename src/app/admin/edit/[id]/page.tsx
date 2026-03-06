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
  krem:        "#F5EDD8",
  kremT:       "#E8D9B8",
  putih:       "#FDF8EE",
};

function toDateInput(d: string | null): string {
  if (!d) return "";
  try { return new Date(d).toISOString().split("T")[0]; }
  catch { return ""; }
}

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

const labelStyle: React.CSSProperties = {
  fontFamily: "'Cinzel',serif",
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: C.emasT,
  display: "block",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(13,11,8,.85)",
  border: `1px solid rgba(201,168,76,.22)`,
  color: C.kremT,
  fontFamily: "'Cormorant Garamond',serif",
  fontSize: "1rem",
  padding: "11px 14px",
  outline: "none",
  transition: "border-color .2s, box-shadow .2s",
  WebkitAppearance: "none",
};

export default function EditPersonPage() {
  const params   = useParams();
  const router   = useRouter();
  const id       = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [nama,    setNama]    = useState("");

  const [form, setForm] = useState({
    nama:          "",
    jenisKelamin:  "LAKI_LAKI" as "LAKI_LAKI" | "PEREMPUAN",
    tanggalLahir:  "",
    tanggalWafat:  "",
    tempatLahir:   "",
    foto:          "",
    bio:           "",
  });

  useEffect(() => { fetchPerson(); }, [id]);

  async function fetchPerson() {
    try {
      const res  = await fetch(`/api/person?id=${id}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const p = data.data[0];
        setNama(p.nama);
        setForm({
          nama:         p.nama,
          jenisKelamin: p.jenisKelamin,
          tanggalLahir: toDateInput(p.tanggalLahir),
          tanggalWafat: toDateInput(p.tanggalWafat),
          tempatLahir:  p.tempatLahir || "",
          foto:         p.foto        || "",
          bio:          p.bio         || "",
        });
      } else {
        setError("Anggota tidak ditemukan");
      }
    } catch {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama.trim()) { setError("Nama wajib diisi"); return; }

    setSaving(true);
    setError("");
    try {
      const res  = await fetch(`/api/person/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          nama:         form.nama.trim(),
          jenisKelamin: form.jenisKelamin,
          tanggalLahir: form.tanggalLahir || null,
          tanggalWafat: form.tanggalWafat || null,
          tempatLahir:  form.tempatLahir.trim()  || null,
          foto:         form.foto.trim()          || null,
          bio:          form.bio.trim()           || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push(`/profil/${id}`), 1500);
      } else {
        setError(data.message || "Gagal menyimpan");
      }
    } catch {
      setError("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.hitam, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 40, height: 40, border: `3px solid rgba(201,168,76,.2)`, borderTopColor: C.emas, borderRadius: "50%", animation: "spin .8s linear infinite" }}/>
    </div>
  );

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.hitam, color: C.krem, fontFamily: "'Cormorant Garamond',serif", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fu  { opacity:0; animation:fadeUp .6s ease forwards; }
        .d1  { animation-delay:.1s; } .d2 { animation-delay:.2s; }
        .edit-input:focus  { border-color:${C.emas}!important; box-shadow:0 0 0 3px rgba(201,168,76,.07)!important; }
        .back-btn:hover    { color:${C.emas}!important; border-color:rgba(201,168,76,.4)!important; }
        .btn-save:hover:not(:disabled)   { box-shadow:0 6px 24px rgba(201,168,76,.38)!important; transform:translateY(-1px)!important; }
        .btn-cancel:hover  { border-color:${C.emas}!important; color:${C.emas}!important; }
        select option { background: ${C.hitamL}; color: ${C.kremT}; }
        @media (max-width:600px) {
          .date-row { grid-template-columns:1fr!important; }
          .btn-row  { flex-direction:column!important; }
        }
      `}</style>

      {/* Gorga bg */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, opacity: .035, pointerEvents: "none", backgroundImage: `repeating-linear-gradient(45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%)`, backgroundSize: "28px 28px" }}/>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Back button */}
        <div className="fu d1" style={{ marginBottom: 32 }}>
          <Link href="/admin" className="back-btn" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.emasT, textDecoration: "none", border: `1px solid rgba(201,168,76,.2)`, padding: "9px 18px", transition: "all .3s" }}>
            <svg width="11" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M5 1L1 5M1 5L5 9M1 5H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Kembali ke Admin
          </Link>
        </div>

        {/* Header */}
        <div className="fu d1" style={{ textAlign: "center", marginBottom: 40 }}>
          <UlosStripe/>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: C.merahTerang, margin: "18px 0 10px" }}>
            Kelola Data · Admin
          </p>
          <h1 style={{ fontFamily: "'Cinzel Decorative',cursive", fontSize: "clamp(1.5rem,4vw,2.5rem)", fontWeight: 700, color: C.putih, marginBottom: 10 }}>
            Edit <span style={{ color: C.emas }}>Anggota</span>
          </h1>
          {nama && (
            <p style={{ fontFamily: "'IM Fell English',serif", fontStyle: "italic", fontSize: "1rem", color: C.kremT, opacity: .65 }}>
              {nama}
            </p>
          )}
        </div>

        {/* Form card */}
        <div className="fu d2" style={{ background: C.hitamL, border: `1px solid rgba(201,168,76,.18)`, position: "relative", overflow: "hidden" }}>
          {/* Top accent */}
          <div style={{ height: 3, background: `linear-gradient(90deg,${C.merahTua},${C.emas},${C.merahTua})` }}/>

          {/* Alert: error */}
          {error && !success && (
            <div style={{ padding: "14px 24px", background: "rgba(139,26,26,.2)", borderBottom: `1px solid rgba(192,57,43,.3)` }}>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.62rem", letterSpacing: "0.1em", color: C.merahTerang, margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Alert: success */}
          {success && (
            <div style={{ padding: "14px 24px", background: "rgba(46,125,50,.15)", borderBottom: `1px solid rgba(46,125,50,.3)` }}>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.62rem", letterSpacing: "0.1em", color: "#81C784", margin: 0 }}>
                Data berhasil disimpan! Mengalihkan ke profil...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Nama */}
              <div>
                <label style={labelStyle}>Nama Lengkap *</label>
                <input
                  className="edit-input"
                  type="text"
                  value={form.nama}
                  onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                  style={inputStyle}
                  required
                />
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label style={labelStyle}>Jenis Kelamin *</label>
                <select
                  className="edit-input"
                  value={form.jenisKelamin}
                  onChange={e => setForm(f => ({ ...f, jenisKelamin: e.target.value as "LAKI_LAKI" | "PEREMPUAN" }))}
                  style={inputStyle}
                >
                  <option value="LAKI_LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
              </div>

              {/* Tempat Lahir */}
              <div>
                <label style={labelStyle}>Tempat Lahir</label>
                <input
                  className="edit-input"
                  type="text"
                  value={form.tempatLahir}
                  onChange={e => setForm(f => ({ ...f, tempatLahir: e.target.value }))}
                  style={inputStyle}
                  placeholder="cth: Medan"
                />
              </div>

              {/* Tanggal */}
              <div className="date-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Tanggal Lahir</label>
                  <input
                    className="edit-input"
                    type="date"
                    value={form.tanggalLahir}
                    onChange={e => setForm(f => ({ ...f, tanggalLahir: e.target.value }))}
                    style={{ ...inputStyle, colorScheme: "dark" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tanggal Wafat</label>
                  <input
                    className="edit-input"
                    type="date"
                    value={form.tanggalWafat}
                    onChange={e => setForm(f => ({ ...f, tanggalWafat: e.target.value }))}
                    style={{ ...inputStyle, colorScheme: "dark" }}
                  />
                </div>
              </div>

              {/* Foto */}
              <div>
                <label style={labelStyle}>URL Foto</label>
                <input
                  className="edit-input"
                  type="text"
                  value={form.foto}
                  onChange={e => setForm(f => ({ ...f, foto: e.target.value }))}
                  style={inputStyle}
                  placeholder="https://example.com/foto.jpg"
                />
                {form.foto && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={form.foto} alt="preview" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: `1px solid rgba(201,168,76,.3)` }} onError={e => (e.currentTarget.style.display = "none")}/>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.55rem", letterSpacing: "0.15em", color: C.emasT, opacity: .7 }}>Preview foto</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label style={labelStyle}>Biografi</label>
                <textarea
                  className="edit-input"
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  rows={6}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Tulis biografi singkat..."
                />
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: `linear-gradient(90deg,transparent,rgba(201,168,76,.15),transparent)` }}/>

              {/* Buttons */}
              <div className="btn-row" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  type="submit"
                  disabled={saving || success}
                  className="btn-save"
                  style={{
                    fontFamily: "'Cinzel',serif", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase",
                    color: C.hitam, fontWeight: 600,
                    background: (saving || success) ? "rgba(201,168,76,.5)" : `linear-gradient(135deg,${C.emas},${C.emasM},${C.emas})`,
                    border: "none", padding: "14px 36px",
                    cursor: (saving || success) ? "not-allowed" : "pointer",
                    clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                    transition: "all .3s",
                    opacity: (saving || success) ? .7 : 1,
                  }}
                >
                  {saving ? "Menyimpan..." : success ? "Tersimpan" : "Simpan Perubahan"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-cancel"
                  style={{
                    fontFamily: "'Cinzel',serif", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase",
                    color: C.emasT, background: "transparent",
                    border: `1px solid rgba(201,168,76,.28)`, padding: "14px 32px",
                    cursor: "pointer",
                    clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                    transition: "all .3s",
                  }}
                >
                  Batal
                </button>
                <Link
                  href={`/profil/${id}`}
                  style={{
                    fontFamily: "'Cinzel',serif", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase",
                    color: C.kremT, textDecoration: "none",
                    border: `1px solid rgba(201,168,76,.15)`, padding: "14px 24px",
                    clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                    transition: "all .3s",
                  }}
                >
                  Lihat Profil
                </Link>
              </div>

            </div>
          </form>
        </div>

        {/* Info relasi */}
        <div style={{ marginTop: 20, padding: "16px 20px", border: `1px solid rgba(201,168,76,.1)`, background: "rgba(139,105,20,.06)" }}>
          <p style={{ fontFamily: "'IM Fell English',serif", fontStyle: "italic", fontSize: "0.82rem", color: C.emasT, opacity: .7, margin: 0 }}>
            Halaman ini mengedit data dasar anggota. Untuk mengubah relasi keluarga (orang tua, pernikahan, anak), gunakan fitur tambah anggota baru.
          </p>
        </div>

      </div>

      <UlosBorder/>
    </div>
  );
}
