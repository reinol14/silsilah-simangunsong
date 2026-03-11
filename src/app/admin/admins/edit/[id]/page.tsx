"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

const UlosStripe = () => (
  <div style={{
    height: 4,
    width: 180,
    margin: "0 auto 24px",
    background: `repeating-linear-gradient(90deg,${C.merah} 0px,${C.merah} 14px,${C.emas} 14px,${C.emas} 20px,${C.hitam} 20px,${C.hitam} 26px,${C.emas} 26px,${C.emas} 32px,${C.merah} 32px,${C.merah} 46px,${C.hitam} 46px,${C.hitam} 50px)`,
  }}
/>
);

export default function EditAdminPage() {
  const router = useRouter();
  const params = useParams();
  const adminId = params.id as string;

  const [formData, setFormData] = useState({
    username: "",
    nama: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    async function fetchAdmin() {
      try {
        const res = await fetch(`/api/admin/${adminId}`, { credentials: "include" });
        const data = await res.json();

        if (data.success) {
          setFormData({
            username: data.data.username,
            nama: data.data.nama,
            password: "",
            confirmPassword: "",
          });
        } else {
          setError(data.error || "Gagal memuat data admin");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    }

    fetchAdmin();
  }, [adminId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validasi
    if (!formData.username || !formData.nama) {
      setError("Username dan nama wajib diisi");
      return;
    }

    // Jika mengubah password
    if (formData.password.trim().length > 0) {
      if (formData.password.length < 6) {
        setError("Password minimal 6 karakter");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Password dan konfirmasi password tidak sama");
        return;
      }
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/${adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: formData.username,
          nama: formData.nama,
          password: formData.password.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/admin/admins");
      } else {
        setError(data.error || "Gagal mengupdate admin");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengupdate admin");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.hitam, color: C.krem, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Inter:wght@400;500;600&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${C.hitam}; }
        `}</style>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.95rem", color: C.emas }}>
          Memuat data...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.hitam, color: C.krem, padding: "40px 24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.hitam}; }
        input:focus { outline: none; border-color: ${C.emas}!important; }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(201,168,76,.3); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <UlosStripe />
          <h1 style={{ fontFamily: "'Cinzel Decorative',cursive", fontSize: "2rem", color: C.emas, marginBottom: 8 }}>
            Edit Admin
          </h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.9rem", color: C.kremT }}>
            Ubah Data Administrator
          </p>
        </div>

        {/* Back Button */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/admin/admins" style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.85rem", color: C.kremT, textDecoration: "none", padding: "10px 20px", border: `1px solid rgba(201,168,76,.2)`, display: "inline-block", transition: "all .3s", borderRadius: 4 }}>
            ← Kembali
          </Link>
        </div>

        {error && (
          <div style={{ background: "rgba(192,57,43,.1)", border: `1px solid ${C.merahTerang}`, padding: "16px", marginBottom: 24, fontFamily: "'Inter',sans-serif", fontSize: "0.9rem", color: C.merahTerang, borderRadius: 4 }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ background: C.hitamL, border: `1px solid rgba(201,168,76,.15)`, padding: "40px 32px" }}>
          {/* Username */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: "0.9rem", fontWeight: 600, color: C.emas, marginBottom: 8 }}>
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Masukkan username"
              style={{ width: "100%", padding: "12px 16px", fontFamily: "'Inter',sans-serif", fontSize: "0.95rem", color: C.putih, background: "rgba(0,0,0,.4)", border: `1px solid rgba(201,168,76,.2)`, transition: "border .3s", borderRadius: 4 }}
              disabled={saving}
            />
          </div>

          {/* Nama */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: "0.9rem", fontWeight: 600, color: C.emas, marginBottom: 8 }}>
              Nama Lengkap *
            </label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              style={{ width: "100%", padding: "12px 16px", fontFamily: "'Inter',sans-serif", fontSize: "0.95rem", color: C.putih, background: "rgba(0,0,0,.4)", border: `1px solid rgba(201,168,76,.2)`, transition: "border .3s", borderRadius: 4 }}
              disabled={saving}
            />
          </div>

          {/* Info Password */}
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(201,168,76,.05)", border: `1px solid rgba(201,168,76,.15)`, borderRadius: 4 }}>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.85rem", color: C.kremT, lineHeight: 1.6 }}>
              <strong>Catatan:</strong> Kosongkan field password jika tidak ingin mengubah password
            </p>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: "0.9rem", fontWeight: 600, color: C.emas, marginBottom: 8 }}>
              Password Baru <span style={{ fontSize: "0.8rem", color: C.kremT, opacity: 0.7, fontWeight: 400 }}>(opsional, min. 6 karakter)</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Kosongkan jika tidak diubah"
                style={{ width: "100%", padding: "12px 16px", paddingRight: "48px", fontFamily: "'Inter',sans-serif", fontSize: "0.95rem", color: C.putih, background: "rgba(0,0,0,.4)", border: `1px solid rgba(201,168,76,.2)`, transition: "border .3s", borderRadius: 4 }}
                disabled={saving}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", padding: 4, color: C.kremT, opacity: 0.6, transition: "opacity .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: "0.9rem", fontWeight: 600, color: C.emas, marginBottom: 8 }}>
              Konfirmasi Password Baru
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password baru"
                style={{ width: "100%", padding: "12px 16px", paddingRight: "48px", fontFamily: "'Inter',sans-serif", fontSize: "0.95rem", color: C.putih, background: "rgba(0,0,0,.4)", border: `1px solid rgba(201,168,76,.2)`, transition: "border .3s", borderRadius: 4 }}
                disabled={saving}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", padding: 4, color: C.kremT, opacity: 0.6, transition: "opacity .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="btn-submit"
            style={{ width: "100%", fontFamily: "'Inter',sans-serif", fontSize: "0.95rem", fontWeight: 600, color: C.hitam, background: `linear-gradient(135deg,${C.emas},${C.emasM})`, padding: "14px 24px", border: "none", cursor: "pointer", transition: "all .3s", borderRadius: 4 }}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}
