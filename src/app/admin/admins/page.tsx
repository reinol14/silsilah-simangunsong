"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

interface Admin {
  id: number;
  username: string;
  nama: string;
  createdAt: string;
  updatedAt: string;
}

const UlosStripe = () => (
  <div style={{
    height: 4,
    width: 180,
    margin: "0 auto 24px",
    background: `repeating-linear-gradient(90deg,${C.merah} 0px,${C.merah} 14px,${C.emas} 14px,${C.emas} 20px,${C.hitam} 20px,${C.hitam} 26px,${C.emas} 26px,${C.emas} 32px,${C.merah} 32px,${C.merah} 46px,${C.hitam} 46px,${C.hitam} 50px)`,
  }}
/>
);

export default function AdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin", { credentials: "include" });
      const data = await res.json();

      if (data.success) {
        setAdmins(data.data);
      } else {
        setError(data.error || "Gagal memuat data admin");
        if (res.status === 401) {
          router.push("/login");
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, nama: string) {
    if (!confirm(`Yakin ingin menghapus admin "${nama}"?\nSemua sesi login admin ini akan dihapus.`)) return;

    try {
      const res = await fetch(`/api/admin/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setAdmins(admins.filter((a) => a.id !== id));
      } else {
        alert(data.error || "Gagal menghapus admin");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus admin");
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.hitam, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: `2px solid rgba(201,168,76,.15)`, borderTopColor: C.emas, borderRadius: "50%", animation: "spin .9s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", letterSpacing: "0.3em", color: C.emasT, textTransform: "uppercase" }}>Memuat...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.hitam, color: C.krem, padding: "40px 24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.hitam}; }
        .btn-add:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(201,168,76,.3); }
        .btn-edit:hover { background: rgba(201,168,76,.15)!important; color: ${C.emasM}!important; }
        .btn-delete:hover { background: rgba(192,57,43,.15)!important; color: ${C.merahTerang}!important; }
        .admin-row:hover { background: rgba(201,168,76,.04)!important; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <UlosStripe />
          <h1 style={{ fontFamily: "'Cinzel Decorative',cursive", fontSize: "2rem", color: C.emas, marginBottom: 8 }}>
            Kelola Admin
          </h1>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.75rem", letterSpacing: "0.3em", color: C.kremT, textTransform: "uppercase" }}>
            Manajemen Akun Administrator
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <Link href="/admin" style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.kremT, textDecoration: "none", padding: "10px 20px", border: `1px solid rgba(201,168,76,.2)`, transition: "all .3s" }}>
            ← Dashboard
          </Link>
          <Link href="/admin/admins/add" className="btn-add" style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.hitam, background: `linear-gradient(135deg,${C.emas},${C.emasM})`, padding: "10px 24px", textDecoration: "none", transition: "all .3s" }}>
            + Tambah Admin
          </Link>
        </div>

        {error && (
          <div style={{ background: "rgba(192,57,43,.1)", border: `1px solid ${C.merahTerang}`, padding: "16px", marginBottom: 24, fontFamily: "'Cinzel',serif", fontSize: "0.85rem", color: C.merahTerang }}>
            {error}
          </div>
        )}

        {/* Admin Table */}
        <div style={{ background: C.hitamL, border: `1px solid rgba(201,168,76,.15)`, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 2fr 2fr 200px", padding: "16px 20px", background: "rgba(201,168,76,.08)", borderBottom: `1px solid rgba(201,168,76,.15)`, fontFamily: "'Cinzel',serif", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.emas }}>
            <div>Username</div>
            <div>Nama</div>
            <div>Dibuat</div>
            <div>Diupdate</div>
            <div style={{ textAlign: "center" }}>Aksi</div>
          </div>

          {/* Rows */}
          {admins.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: "'Cinzel',serif", fontSize: "0.85rem", color: C.kremT, fontStyle: "italic" }}>
              Belum ada admin
            </div>
          ) : (
            admins.map((admin) => (
              <div key={admin.id} className="admin-row" style={{ display: "grid", gridTemplateColumns: "2fr 2fr 2fr 2fr 200px", padding: "16px 20px", borderBottom: `1px solid rgba(201,168,76,.08)`, transition: "background .3s" }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.85rem", color: C.putih, fontWeight: 600 }}>
                  {admin.username}
                </div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.85rem", color: C.kremT }}>
                  {admin.nama}
                </div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.75rem", color: C.kremT, opacity: 0.7 }}>
                  {formatDate(admin.createdAt)}
                </div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.75rem", color: C.kremT, opacity: 0.7 }}>
                  {formatDate(admin.updatedAt)}
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <Link href={`/admin/admins/edit/${admin.id}`} className="btn-edit" style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: C.emas, background: "rgba(201,168,76,.08)", padding: "6px 14px", textDecoration: "none", border: `1px solid rgba(201,168,76,.2)`, transition: "all .3s" }}>
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(admin.id, admin.nama)} className="btn-delete" style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: C.merahTerang, background: "rgba(192,57,43,.08)", padding: "6px 14px", border: `1px solid rgba(192,57,43,.2)`, cursor: "pointer", transition: "all .3s" }}>
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div style={{ marginTop: 24, textAlign: "center", fontFamily: "'Cinzel',serif", fontSize: "0.75rem", color: C.kremT, opacity: 0.6 }}>
          Total: {admins.length} admin
        </div>
      </div>
    </div>
  );
}
