"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Person = {
  id: number;
  nama: string;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
  tanggalLahir: string | null;
};

type ChildItem = {
  id: number;
  personId: number;
  urutanAnak: number | null;
  person: {
    id: number;
    nama: string;
  };
};

type Marriage = {
  id: number;
  husband: { id: number; nama: string };
  wife: { id: number; nama: string };
  children: ChildItem[];
};

const C = {
  merah: "#8B1A1A",
  merahTua: "#5C0E0E",
  emas: "#C9A84C",
  emasM: "#E8CC7A",
  emasT: "#8B6914",
  hitam: "#0D0B08",
  hitamL: "#1A1612",
  krem: "#F5EDD8",
  kremT: "#E8D9B8",
  putih: "#FDF8EE",
};

export default function MasterAnakPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [persons, setPersons] = useState<Person[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [selectedMarriageId, setSelectedMarriageId] = useState<number | "">("");

  const [newPersonId, setNewPersonId] = useState<number | "">("");
  const [newUrutan, setNewUrutan] = useState<string>("");

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      const authRes = await fetch("/api/auth/me", { credentials: "include" });
      const authData = await authRes.json();
      if (!authData.success) {
        router.push("/login");
        return;
      }

      await loadData();
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function loadData() {
    const [mRes, pRes] = await Promise.all([
      fetch("/api/marriage", { credentials: "include" }),
      fetch("/api/person/list", { credentials: "include" }),
    ]);

    const mData = await mRes.json();
    const pData = await pRes.json();

    if (!mData.success || !pData.success) {
      throw new Error("Gagal memuat data");
    }

    setMarriages(mData.data || []);
    setPersons(pData.data || []);

    if ((mData.data || []).length > 0 && !selectedMarriageId) {
      setSelectedMarriageId(mData.data[0].id);
    }
  }

  const selectedMarriage = useMemo(() => {
    if (!selectedMarriageId) return null;
    return marriages.find((m) => m.id === selectedMarriageId) || null;
  }, [marriages, selectedMarriageId]);

  const existingChildIds = useMemo(() => {
    if (!selectedMarriage) return new Set<number>();
    return new Set(selectedMarriage.children.map((c) => c.personId));
  }, [selectedMarriage]);

  const addCandidates = useMemo(() => {
    if (!selectedMarriage) return [] as Person[];

    return persons.filter((p) => {
      if (p.id === selectedMarriage.husband.id || p.id === selectedMarriage.wife.id) return false;
      return !existingChildIds.has(p.id);
    });
  }, [persons, selectedMarriage, existingChildIds]);

  async function handleAddChild() {
    if (!selectedMarriage || !newPersonId) {
      setError("Pilih pasangan dan person terlebih dahulu");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          marriageId: selectedMarriage.id,
          personId: newPersonId,
          urutanAnak: newUrutan ? Number(newUrutan) : null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Gagal menambahkan anak");
        return;
      }

      setSuccess("Anak berhasil ditambahkan");
      setNewPersonId("");
      setNewUrutan("");
      await loadData();
    } catch {
      setError("Terjadi kesalahan saat menambahkan anak");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateChild(childId: number, personId: number, urutanAnak: number | null) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/child/${childId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ personId, urutanAnak }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Gagal update data anak");
        return;
      }

      setSuccess("Data anak berhasil diperbarui");
      await loadData();
    } catch {
      setError("Terjadi kesalahan saat memperbarui data anak");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.hitam, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: `3px solid rgba(201,168,76,.2)`, borderTopColor: C.emas, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.hitam, color: C.krem, fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .master-card { background: ${C.hitamL}; border: 1px solid rgba(201,168,76,.18); }
        .inp { width: 100%; background: rgba(13,11,8,.85); border: 1px solid rgba(201,168,76,.24); color: ${C.kremT}; padding: 10px 12px; font-family: 'Cormorant Garamond', serif; }
        .inp:focus { outline: none; border-color: ${C.emas}; box-shadow: 0 0 0 3px rgba(201,168,76,.08); }
        .btn { font-family: 'Cinzel', serif; font-size: .65rem; letter-spacing: .12em; text-transform: uppercase; cursor: pointer; }
      `}</style>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "36px 20px 60px" }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/admin/urutan-anak" style={{ color: C.emasT, textDecoration: "none", fontFamily: "'Cinzel',serif", fontSize: ".62rem", letterSpacing: ".18em", textTransform: "uppercase" }}>
            ← Kembali ke Urutan Anak
          </Link>
        </div>

        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: ".6rem", letterSpacing: ".34em", textTransform: "uppercase", color: C.emasT, marginBottom: 8 }}>
            Master Data Anak Pasangan
          </p>
          <h1 style={{ fontFamily: "'Cinzel Decorative',cursive", fontSize: "clamp(1.4rem,4vw,2rem)", color: C.putih }}>
            Tambah / Edit <span style={{ color: C.emas }}>Anak Existing</span>
          </h1>
        </div>

        {error && (
          <div style={{ marginBottom: 12, padding: "10px 12px", background: "rgba(139,26,26,.2)", border: "1px solid rgba(192,57,43,.4)", color: "#F2A6A0", fontFamily: "'Cinzel',serif", fontSize: ".63rem", letterSpacing: ".08em" }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ marginBottom: 12, padding: "10px 12px", background: "rgba(23,118,57,.2)", border: "1px solid rgba(122,206,143,.4)", color: "#9DE0B1", fontFamily: "'Cinzel',serif", fontSize: ".63rem", letterSpacing: ".08em" }}>
            {success}
          </div>
        )}

        <div className="master-card" style={{ padding: 16, marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontFamily: "'Cinzel',serif", fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: C.emasT }}>
            Pilih Pasangan
          </label>
          <select
            className="inp"
            value={selectedMarriageId}
            onChange={(e) => setSelectedMarriageId(Number(e.target.value))}
          >
            {(marriages || []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.husband.nama} &amp; {m.wife.nama}
              </option>
            ))}
          </select>
        </div>

        {selectedMarriage && (
          <>
            <div className="master-card" style={{ padding: 16, marginBottom: 16 }}>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: C.emasT, marginBottom: 10 }}>
                Tambah Anak dari Data Person Existing
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 10 }}>
                <select className="inp" value={newPersonId} onChange={(e) => setNewPersonId(Number(e.target.value) || "")}> 
                  <option value="">-- Pilih Person --</option>
                  {addCandidates.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama}{p.tanggalLahir ? ` (${new Date(p.tanggalLahir).getFullYear()})` : ""}
                    </option>
                  ))}
                </select>

                <input
                  className="inp"
                  type="number"
                  min={1}
                  value={newUrutan}
                  placeholder="Urutan"
                  onChange={(e) => setNewUrutan(e.target.value)}
                />

                <button
                  className="btn"
                  type="button"
                  disabled={saving || !newPersonId}
                  onClick={handleAddChild}
                  style={{
                    padding: "0 16px",
                    border: "none",
                    color: C.hitam,
                    background: `linear-gradient(135deg,${C.emas},${C.emasM})`,
                    opacity: saving || !newPersonId ? 0.5 : 1,
                  }}
                >
                  Tambah
                </button>
              </div>
            </div>

            <div className="master-card" style={{ padding: 16 }}>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: C.emasT, marginBottom: 10 }}>
                Edit Data Anak Saat Ini
              </p>

              {selectedMarriage.children.length === 0 ? (
                <p style={{ color: C.kremT, opacity: 0.75 }}>Belum ada anak pada pasangan ini.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {selectedMarriage.children
                    .slice()
                    .sort((a, b) => (a.urutanAnak ?? 999) - (b.urutanAnak ?? 999))
                    .map((child) => (
                      <EditableChildRow
                        key={child.id}
                        child={child}
                        persons={persons}
                        selectedMarriage={selectedMarriage}
                        saving={saving}
                        onSave={handleUpdateChild}
                      />
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EditableChildRow({
  child,
  persons,
  selectedMarriage,
  saving,
  onSave,
}: {
  child: ChildItem;
  persons: Person[];
  selectedMarriage: Marriage;
  saving: boolean;
  onSave: (childId: number, personId: number, urutanAnak: number | null) => Promise<void>;
}) {
  const [personId, setPersonId] = useState<number>(child.personId);
  const [urutan, setUrutan] = useState<string>(child.urutanAnak?.toString() || "");

  const options = useMemo(() => {
    const usedByOthers = new Set(
      selectedMarriage.children.filter((c) => c.id !== child.id).map((c) => c.personId)
    );

    return persons.filter((p) => {
      if (p.id === selectedMarriage.husband.id || p.id === selectedMarriage.wife.id) return false;
      if (p.id === child.personId) return true;
      return !usedByOthers.has(p.id);
    });
  }, [persons, selectedMarriage, child.id, child.personId]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 10, alignItems: "center", padding: 10, border: "1px solid rgba(201,168,76,.14)", background: "rgba(13,11,8,.35)" }}>
      <select className="inp" value={personId} onChange={(e) => setPersonId(Number(e.target.value))}>
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nama}{p.tanggalLahir ? ` (${new Date(p.tanggalLahir).getFullYear()})` : ""}
          </option>
        ))}
      </select>

      <input
        className="inp"
        type="number"
        min={1}
        value={urutan}
        placeholder="Urutan"
        onChange={(e) => setUrutan(e.target.value)}
      />

      <button
        className="btn"
        type="button"
        disabled={saving}
        onClick={() => onSave(child.id, personId, urutan ? Number(urutan) : null)}
        style={{ padding: "10px 16px", border: "1px solid rgba(201,168,76,.35)", color: "#E8CC7A", background: "rgba(201,168,76,.08)" }}
      >
        Simpan
      </button>
    </div>
  );
}
