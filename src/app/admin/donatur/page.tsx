"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const C = {
  merah: "#8B1A1A", merahTua: "#5C0E0E", merahTerang: "#C0392B",
  emas: "#C9A84C", emasM: "#E8CC7A", emasT: "#8B6914",
  hitam: "#0D0B08", hitamL: "#1A1612", krem: "#F5EDD8",
  kremT: "#E8D9B8", putih: "#FDF8EE",
};

interface Donatur {
  id: number;
  nama: string;
  nominal: number;
  pesan: string | null;
  tanggal: string;
  tampilkan: boolean;
}

const emptyForm = { nama: "", nominal: "", pesan: "", tanggal: new Date().toISOString().split("T")[0], tampilkan: true };

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function formatTanggal(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

const UlosBorder = () => (
  <div style={{ height: 6, width: "100%", background: `repeating-linear-gradient(90deg,${C.merahTua} 0px,${C.merahTua} 20px,${C.emasT} 20px,${C.emasT} 28px,${C.hitam} 28px,${C.hitam} 36px,${C.emasT} 36px,${C.emasT} 44px,${C.merahTua} 44px,${C.merahTua} 64px,${C.hitam} 64px,${C.hitam} 68px)` }} />
);

export default function AdminDonaturPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [donaturs, setDonaturs] = useState<Donatur[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.success) router.push("/login");
      else load();
    });
  }, []);

  async function load() {
    setLoading(true);
    try {
      // Admin melihat semua (termasuk yang tampilkan=false) — tambahkan param all=1
      const res = await fetch("/api/donatur?all=1");
      const data = await res.json();
      if (data.success) setDonaturs(data.data);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(d: Donatur) {
    setEditId(d.id);
    setForm({
      nama: d.nama,
      nominal: String(d.nominal),
      pesan: d.pesan ?? "",
      tanggal: d.tanggal.split("T")[0],
      tampilkan: d.tampilkan,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.nama.trim() || !form.nominal || !form.tanggal) {
      setMsg({ type: "err", text: "Nama, nominal, dan tanggal wajib diisi." });
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, nominal: Number(form.nominal) };
      const url = editId ? `/api/donatur/${editId}` : "/api/donatur";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "ok", text: editId ? "Data diperbarui." : "Donatur ditambahkan." });
        setShowForm(false);
        load();
      } else {
        setMsg({ type: "err", text: data.message ?? "Gagal menyimpan." });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/donatur/${id}`, { method: "DELETE", credentials: "include" });
    const data = await res.json();
    if (data.success) {
      setMsg({ type: "ok", text: "Donatur dihapus." });
      setDeleteId(null);
      load();
    } else {
      setMsg({ type: "err", text: "Gagal menghapus." });
    }
  }

  async function toggleTampilkan(d: Donatur) {
    await fetch(`/api/donatur/${d.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tampilkan: !d.tampilkan }),
    });
    load();
  }

  const totalDonasi = donaturs.filter(d => d.tampilkan).reduce((sum, d) => sum + d.nominal, 0);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.hitam, color: C.krem, fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, select { outline: none; }
        .row-hover:hover { background: rgba(201,168,76,.04) !important; }
        .btn-icon:hover { opacity: 1 !important; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid rgba(201,168,76,.15)`, background: C.hitamL, padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/admin" style={{ fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.emasT, textDecoration: "none", opacity: .7 }}>
            ← Dashboard
          </Link>
          <div style={{ width: 1, height: 16, background: "rgba(201,168,76,.2)" }} />
          <span style={{ fontFamily: "'Cinzel Decorative',cursive", fontSize: "1rem", color: C.emas }}>Kelola Donatur</span>
        </div>
        <button onClick={openAdd} style={{ fontFamily: "'Cinzel',serif", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.hitam, background: `linear-gradient(135deg,${C.emas},${C.emasM})`, border: "none", padding: "10px 24px", cursor: "pointer", clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)" }}>
          + Tambah Donatur
        </button>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>

        {/* Notif */}
        {msg && (
          <div style={{ marginBottom: 20, padding: "12px 20px", border: `1px solid ${msg.type === "ok" ? "rgba(76,201,76,.3)" : "rgba(201,76,76,.3)"}`, background: msg.type === "ok" ? "rgba(76,201,76,.06)" : "rgba(201,76,76,.06)", display: "flex", justifyContent: "space-between", alignItems: "center", animation: "fadeIn .3s" }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.7rem", color: msg.type === "ok" ? "#76c176" : "#c17676" }}>{msg.text}</span>
            <button onClick={() => setMsg(null)} style={{ background: "none", border: "none", color: C.emasT, cursor: "pointer", fontSize: "1rem" }}>×</button>
          </div>
        )}

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Total Donatur", value: String(donaturs.length) },
            { label: "Ditampilkan", value: String(donaturs.filter(d => d.tampilkan).length) },
            { label: "Total Donasi", value: formatRupiah(totalDonasi) },
          ].map((s, i) => (
            <div key={i} style={{ background: C.hitamL, border: `1px solid rgba(201,168,76,.12)`, padding: "20px 24px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Cinzel Decorative',cursive", fontSize: "1.4rem", color: C.emas, marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.emasT, opacity: .7 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Form tambah/edit */}
        {showForm && (
          <div style={{ marginBottom: 32, border: `1px solid rgba(201,168,76,.25)`, background: C.hitamL, animation: "fadeIn .3s" }}>
            <div style={{ height: 3, background: `linear-gradient(90deg,${C.merahTua},${C.emas},${C.merahTua})` }} />
            <div style={{ padding: "28px 32px" }}>
              <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.emas, marginBottom: 24 }}>
                {editId ? "Edit Donatur" : "Tambah Donatur Baru"}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Nama */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.emasT }}>Nama Donatur *</label>
                  <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} placeholder="Nama lengkap" style={{ background: "rgba(13,11,8,.6)", border: `1px solid rgba(201,168,76,.2)`, color: C.krem, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", padding: "10px 14px" }} />
                </div>
                {/* Nominal */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.emasT }}>Nominal (Rp) *</label>
                  <input type="number" value={form.nominal} onChange={e => setForm(f => ({ ...f, nominal: e.target.value }))} placeholder="Contoh: 100000" style={{ background: "rgba(13,11,8,.6)", border: `1px solid rgba(201,168,76,.2)`, color: C.krem, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", padding: "10px 14px", colorScheme: "dark" }} />
                </div>
                {/* Tanggal */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.emasT }}>Tanggal Donasi *</label>
                  <input type="date" value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} style={{ background: "rgba(13,11,8,.6)", border: `1px solid rgba(201,168,76,.2)`, color: C.krem, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", padding: "10px 14px", colorScheme: "dark" }} />
                </div>
                {/* Tampilkan */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "flex-end" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={form.tampilkan} onChange={e => setForm(f => ({ ...f, tampilkan: e.target.checked }))} style={{ width: 16, height: 16, accentColor: C.emas, cursor: "pointer" }} />
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.kremT }}>Tampilkan di halaman depan</span>
                  </label>
                </div>
                {/* Pesan */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, gridColumn: "span 2" }}>
                  <label style={{ fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.emasT }}>Pesan / Ucapan (opsional)</label>
                  <textarea value={form.pesan} onChange={e => setForm(f => ({ ...f, pesan: e.target.value }))} rows={2} placeholder="Pesan dari donatur..." style={{ background: "rgba(13,11,8,.6)", border: `1px solid rgba(201,168,76,.2)`, color: C.krem, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", padding: "10px 14px", resize: "vertical" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button onClick={handleSave} disabled={saving} style={{ fontFamily: "'Cinzel',serif", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.hitam, background: `linear-gradient(135deg,${C.emas},${C.emasM})`, border: "none", padding: "12px 28px", cursor: saving ? "wait" : "pointer", clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)", opacity: saving ? .7 : 1 }}>
                  {saving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambahkan"}
                </button>
                <button onClick={() => setShowForm(false)} style={{ fontFamily: "'Cinzel',serif", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.emas, background: "transparent", border: `1px solid rgba(201,168,76,.4)`, padding: "12px 28px", cursor: "pointer", clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)" }}>
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabel donatur */}
        <div style={{ border: `1px solid rgba(201,168,76,.12)`, overflow: "hidden" }}>
          <div style={{ height: 3, background: `linear-gradient(90deg,${C.merahTua},${C.emas},${C.merahTua})` }} />
          {/* Header tabel */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 120px", gap: 0, background: "rgba(201,168,76,.05)", borderBottom: `1px solid rgba(201,168,76,.12)`, padding: "10px 20px" }}>
            {["Nama Donatur", "Nominal", "Tanggal", "Status", "Aksi"].map(h => (
              <span key={h} style={{ fontFamily: "'Cinzel',serif", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", color: C.emasT }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", fontFamily: "'Cinzel',serif", fontSize: "0.7rem", color: C.emasT, letterSpacing: "0.2em" }}>Memuat data...</div>
          ) : donaturs.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", fontFamily: "'IM Fell English',serif", fontStyle: "italic", fontSize: "1rem", color: C.emasT, opacity: .6 }}>
              Belum ada data donatur. Klik &ldquo;Tambah Donatur&rdquo; untuk menambahkan.
            </div>
          ) : (
            donaturs.map((d, i) => (
              <div key={d.id} className="row-hover" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 120px", gap: 0, padding: "14px 20px", borderBottom: i < donaturs.length - 1 ? `1px solid rgba(201,168,76,.07)` : "none", alignItems: "center", transition: "background .2s" }}>
                <div>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.8rem", color: C.kremT, marginBottom: d.pesan ? 2 : 0 }}>{d.nama}</p>
                  {d.pesan && <p style={{ fontFamily: "'IM Fell English',serif", fontStyle: "italic", fontSize: "0.75rem", color: C.emasT, opacity: .7 }}>&ldquo;{d.pesan}&rdquo;</p>}
                </div>
                <span style={{ fontFamily: "'Cinzel Decorative',cursive", fontSize: "0.82rem", color: C.emas }}>{formatRupiah(d.nominal)}</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.88rem", color: C.kremT, opacity: .7 }}>{formatTanggal(d.tanggal)}</span>
                <div>
                  <button onClick={() => toggleTampilkan(d)} style={{ fontFamily: "'Cinzel',serif", fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", border: `1px solid ${d.tampilkan ? "rgba(76,201,76,.3)" : "rgba(201,76,76,.3)"}`, background: d.tampilkan ? "rgba(76,201,76,.08)" : "rgba(201,76,76,.08)", color: d.tampilkan ? "#76c176" : "#c17676", padding: "4px 10px", cursor: "pointer" }}>
                    {d.tampilkan ? "Tampil" : "Disembunyikan"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-icon" onClick={() => openEdit(d)} style={{ background: "rgba(201,168,76,.1)", border: `1px solid rgba(201,168,76,.2)`, color: C.emas, padding: "6px 12px", cursor: "pointer", fontSize: "0.72rem", fontFamily: "'Cinzel',serif", opacity: .8, transition: "opacity .2s" }}>Edit</button>
                  <button className="btn-icon" onClick={() => setDeleteId(d.id)} style={{ background: "rgba(139,26,26,.15)", border: `1px solid rgba(139,26,26,.3)`, color: C.merahTerang, padding: "6px 10px", cursor: "pointer", fontSize: "0.72rem", fontFamily: "'Cinzel',serif", opacity: .8, transition: "opacity .2s" }}>Hapus</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialog konfirmasi hapus */}
      {deleteId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.hitamL, border: `1px solid rgba(201,168,76,.2)`, padding: "36px 40px", maxWidth: 400, width: "90%", textAlign: "center", animation: "fadeIn .25s" }}>
            <div style={{ height: 3, background: `linear-gradient(90deg,${C.merahTua},${C.emas},${C.merahTua})`, marginBottom: 24 }} />
            <h3 style={{ fontFamily: "'Cinzel Decorative',cursive", fontSize: "1rem", color: C.putih, marginBottom: 12 }}>Hapus Donatur</h3>
            <p style={{ fontFamily: "'IM Fell English',serif", fontStyle: "italic", fontSize: "0.95rem", color: C.kremT, opacity: .75, marginBottom: 28 }}>
              Data donatur ini akan dihapus permanen. Lanjutkan?
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => handleDelete(deleteId)} style={{ fontFamily: "'Cinzel',serif", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.putih, background: C.merah, border: "none", padding: "11px 28px", cursor: "pointer", clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)" }}>
                Ya, Hapus
              </button>
              <button onClick={() => setDeleteId(null)} style={{ fontFamily: "'Cinzel',serif", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.emas, background: "transparent", border: `1px solid rgba(201,168,76,.4)`, padding: "11px 28px", cursor: "pointer", clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)" }}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <UlosBorder />
    </div>
  );
}
