"use client";

import { useState, useEffect } from "react";

interface Person {
  id: number;
  nama: string;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
  foto: string | null;
}

interface Marriage {
  id: number;
  husband: { id: number; nama: string; foto: string | null };
  wife: { id: number; nama: string; foto: string | null };
  children: { person: { id: number; nama: string } }[];
}

interface ComplexPersonFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  border: "2px solid #E5E7EB",
  borderRadius: "8px",
  fontSize: "15px",
  outline: "none",
  transition: "border-color 0.2s",
};

export default function ComplexPersonForm({ onSuccess, onCancel }: ComplexPersonFormProps) {
  const [step, setStep] = useState(1);
  const [persons, setPersons] = useState<Person[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    jenisKelamin: "LAKI_LAKI" as "LAKI_LAKI" | "PEREMPUAN",
    tanggalLahir: "",
    tanggalWafat: "",
    tempatLahir: "",
    foto: "",
    hasParents: false,
    parentMarriageId: "",
    isMarried: false,
    spouseId: "",
    spouseOption: "existing" as "existing" | "new", // pilih dari daftar atau tambah baru
    tanggalMenikah: "",
    hasChildren: false,
    childrenIds: [] as number[],
  });

  // Data untuk pasangan baru
  const [newSpouseData, setNewSpouseData] = useState({
    nama: "",
    jenisKelamin: "" as "LAKI_LAKI" | "PEREMPUAN" | "",
    tanggalLahir: "",
    tempatLahir: "",
    foto: "",
  });

  useEffect(() => {
    fetchPersons();
    fetchMarriages();
  }, []);

  const fetchPersons = async () => {
    try {
      const response = await fetch("/api/person/list");
      const result = await response.json();
      if (result.success) setPersons(result.data);
    } catch (err) {
      console.error("Error fetching persons:", err);
    }
  };

  const fetchMarriages = async () => {
    try {
      const response = await fetch("/api/marriage");
      const result = await response.json();
      if (result.success) setMarriages(result.data);
    } catch (err) {
      console.error("Error fetching marriages:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Reset spouse data when switching option
    if (name === "spouseOption") {
      setFormData((prev) => ({ ...prev, spouseId: "", spouseOption: value as "existing" | "new" }));
      setNewSpouseData({ nama: "", jenisKelamin: "", tanggalLahir: "", tempatLahir: "", foto: "" });
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
    
    setError("");
  };

  const handleNewSpouseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSpouseData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleChildToggle = (childId: number) => {
    setFormData((prev) => ({
      ...prev,
      childrenIds: prev.childrenIds.includes(childId)
        ? prev.childrenIds.filter((id) => id !== childId)
        : [...prev.childrenIds, childId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      setError("Nama wajib diisi");
      return;
    }
    
    // Validasi untuk pasangan
    if (formData.isMarried) {
      if (formData.spouseOption === "existing" && !formData.spouseId) {
        setError("Pilih pasangan dari daftar");
        return;
      }
      if (formData.spouseOption === "new" && !newSpouseData.nama.trim()) {
        setError("Nama pasangan wajib diisi");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      let finalSpouseId = formData.spouseId;

      // Jika pilih tambah pasangan baru, create dulu pasangannya
      if (formData.isMarried && formData.spouseOption === "new") {
        // Set jenis kelamin pasangan otomatis (kebalikan dari person utama)
        const spouseGender = formData.jenisKelamin === "LAKI_LAKI" ? "PEREMPUAN" : "LAKI_LAKI";
        
        const spouseResponse = await fetch("/api/person", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            nama: newSpouseData.nama.trim(),
            jenisKelamin: spouseGender,
            tanggalLahir: newSpouseData.tanggalLahir || null,
            tempatLahir: newSpouseData.tempatLahir.trim() || null,
            foto: newSpouseData.foto.trim() || null,
          }),
        });

        const spouseResult = await spouseResponse.json();
        if (!spouseResponse.ok || !spouseResult.success) {
          throw new Error(spouseResult.message || "Gagal membuat data pasangan");
        }

        finalSpouseId = spouseResult.data.id.toString();
      }

      // Create person utama dengan relasi
      const response = await fetch("/api/person/create-with-relations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nama: formData.nama.trim(),
          jenisKelamin: formData.jenisKelamin,
          tanggalLahir: formData.tanggalLahir || null,
          tanggalWafat: formData.tanggalWafat || null,
          tempatLahir: formData.tempatLahir.trim() || null,
          foto: formData.foto.trim() || null,
          parentMarriageId: formData.hasParents ? parseInt(formData.parentMarriageId) : null,
          isMarried: formData.isMarried,
          spouseId: formData.isMarried ? parseInt(finalSpouseId) : null,
          tanggalMenikah: formData.tanggalMenikah || null,
          childrenIds: formData.hasChildren ? formData.childrenIds : [],
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan data");
      }

      setSuccess("✓ Data berhasil disimpan!");
      if (onSuccess) setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validasi sebelum lanjut ke step berikutnya
    if (step === 3 && formData.isMarried) {
      if (formData.spouseOption === "existing" && !formData.spouseId) {
        setError("Pilih pasangan dari daftar");
        return;
      }
      if (formData.spouseOption === "new" && !newSpouseData.nama.trim()) {
        setError("Nama pasangan wajib diisi");
        return;
      }
    }
    setError("");
    setStep((prev) => Math.min(prev + 1, 4));
  };
  
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const getPotentialSpouses = () => {
    const oppositeGender = formData.jenisKelamin === "LAKI_LAKI" ? "PEREMPUAN" : "LAKI_LAKI";
    return persons.filter((p) => p.jenisKelamin === oppositeGender);
  };

  const getAvailableChildren = () => persons.filter((p) => p.id !== parseInt(formData.spouseId));

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div style={{
        background: "white",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        padding: "24px 32px",
        marginBottom: 24,
        borderLeft: "4px solid #8B1A1A",
      }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#8B1A1A", marginBottom: 8 }}>
          ➕ Tambah Anggota Keluarga Baru
        </h2>
        <p style={{ color: "#6B7280", fontSize: "0.95rem" }}>
          Isi formulir ini untuk menambahkan anggota keluarga beserta informasi relasinya
        </p>
      </div>

      {/* Progress */}
      <div style={{
        background: "white",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        padding: "32px",
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {[
            { num: 1, label: "Data Diri", icon: "📝" },
            { num: 2, label: "Orang Tua", icon: "👪" },
            { num: 3, label: "Pernikahan", icon: "💑" },
            { num: 4, label: "Anak-anak", icon: "👶" }
          ].map((s, idx) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 80 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  backgroundColor: step >= s.num ? "#8B1A1A" : "#F3F4F6",
                  color: step >= s.num ? "white" : "#9CA3AF",
                  transition: "all 0.3s",
                  marginBottom: 8,
                }}>
                  {step > s.num ? "✓" : s.icon}
                </div>
                <span style={{
                  fontSize: "0.8rem",
                  color: step >= s.num ? "#8B1A1A" : "#9CA3AF",
                  fontWeight: step === s.num ? "600" : "400",
                  textAlign: "center",
                }}>
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div style={{
                  flex: 1,
                  height: 3,
                  margin: "0 12px",
                  backgroundColor: step > s.num ? "#8B1A1A" : "#E5E7EB",
                  marginBottom: 32,
                  borderRadius: 2,
                  transition: "all 0.3s",
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div style={{
        background: "white",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        padding: "40px",
      }}>
        <form 
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // Cegah Enter dari submit form jika belum di step terakhir
            if (e.key === "Enter" && step < 4) {
              e.preventDefault();
              // Jika di step sebelum terakhir dan user tekan Enter, pindah ke step berikutnya
              if (step === 1 && formData.nama) {
                nextStep();
              }
            }
          }}
        >
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#1F2937", marginBottom: 8 }}>
                  📝 Data Diri
                </h3>
                <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>
                  Masukkan informasi dasar tentang anggota keluarga
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 8 }}>
                    Nama Lengkap <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="Contoh: John Simangunsong"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 8 }}>
                    Jenis Kelamin <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <select
                    name="jenisKelamin"
                    value={formData.jenisKelamin}
                    onChange={handleChange}
                    style={{ ...inputStyle, backgroundColor: "white" }}
                    required
                  >
                    <option value="LAKI_LAKI">👨 Laki-laki</option>
                    <option value="PEREMPUAN">👩 Perempuan</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 8 }}>
                      Tanggal Lahir
                    </label>
                    <input type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 8 }}>
                      Tempat Lahir
                    </label>
                    <input type="text" name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} style={inputStyle} placeholder="Contoh: Medan" />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 8 }}>
                    Tanggal Wafat <span style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>(opsional)</span>
                  </label>
                  <input type="date" name="tanggalWafat" value={formData.tanggalWafat} onChange={handleChange} style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 8 }}>
                    URL Foto <span style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>(opsional)</span>
                  </label>
                  <input type="url" name="foto" value={formData.foto} onChange={handleChange} style={inputStyle} placeholder="https://example.com/foto.jpg" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#1F2937", marginBottom: 8 }}>
                  👪 Informasi Orang Tua
                </h3>
                <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>
                  Hubungkan dengan pernikahan orang tua jika sudah tercatat dalam sistem
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ background: "#EFF6FF", border: "2px solid #DBEAFE", borderRadius: 12, padding: 20 }}>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      name="hasParents"
                      checked={formData.hasParents}
                      onChange={handleChange}
                      style={{ width: 20, height: 20, marginRight: 12, cursor: "pointer" }}
                    />
                    <span style={{ fontWeight: "600", color: "#1E40AF", fontSize: "0.95rem" }}>
                      ✓ Orang ini adalah anak dari pernikahan yang sudah tercatat
                    </span>
                  </label>
                </div>

                {formData.hasParents && (
                  <div>
                    <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 8 }}>
                      Pilih Pernikahan Orang Tua <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <select
                      name="parentMarriageId"
                      value={formData.parentMarriageId}
                      onChange={handleChange}
                      style={{ ...inputStyle, backgroundColor: "white" }}
                      required={formData.hasParents}
                    >
                      <option value="">-- Pilih Orang Tua --</option>
                      {marriages.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.husband.nama} ❤️ {m.wife.nama} {m.children.length > 0 && `(${m.children.length} anak)`}
                        </option>
                      ))}
                    </select>
                    {marriages.length === 0 && (
                      <p style={{ color: "#6B7280", fontSize: "0.85rem", marginTop: 8 }}>
                        ℹ️ Belum ada pernikahan yang tercatat. Tambahkan pernikahan orang tua terlebih dahulu.
                      </p>
                    )}
                  </div>
                )}

                {!formData.hasParents && (
                  <div style={{ background: "#FEF3C7", border: "2px solid #FDE68A", borderRadius: 12, padding: 20 }}>
                    <p style={{ color: "#92400E", fontSize: "0.9rem", margin: 0 }}>
                      💡 Anda bisa melewati langkah ini dan menambahkan relasi orang tua nanti jika diperlukan.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#1F2937", marginBottom: 8 }}>
                  💑 Status Pernikahan
                </h3>
                <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>
                  Apakah orang ini sudah menikah? Jika ya, pilih pasangannya
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ background: "#EFF6FF", border: "2px solid #DBEAFE", borderRadius: 12, padding: 20 }}>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      name="isMarried"
                      checked={formData.isMarried}
                      onChange={handleChange}
                      style={{ width: 20, height: 20, marginRight: 12, cursor: "pointer" }}
                    />
                    <span style={{ fontWeight: "600", color: "#1E40AF", fontSize: "0.95rem" }}>
                      💍 Orang ini sudah menikah
                    </span>
                  </label>
                </div>

                {formData.isMarried && (
                  <>
                    {/* Opsi: Pilih dari daftar atau Tambah baru */}
                    <div style={{ background: "#F9FAFB", border: "2px solid #E5E7EB", borderRadius: 12, padding: 20 }}>
                      <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 12 }}>
                        Pilih Metode <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <label style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "10px 16px", background: formData.spouseOption === "existing" ? "#EFF6FF" : "white", border: formData.spouseOption === "existing" ? "2px solid #3B82F6" : "2px solid #D1D5DB", borderRadius: 8, flex: 1, minWidth: 200 }}>
                          <input
                            type="radio"
                            name="spouseOption"
                            value="existing"
                            checked={formData.spouseOption === "existing"}
                            onChange={handleChange}
                            style={{ width: 18, height: 18, marginRight: 10, cursor: "pointer" }}
                          />
                          <div>
                            <span style={{ fontWeight: "600", color: "#1F2937", display: "block", fontSize: "0.9rem" }}>
                              📋 Pilih dari Daftar
                            </span>
                            <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                              Pasangan sudah terdaftar
                            </span>
                          </div>
                        </label>

                        <label style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "10px 16px", background: formData.spouseOption === "new" ? "#EFF6FF" : "white", border: formData.spouseOption === "new" ? "2px solid #3B82F6" : "2px solid #D1D5DB", borderRadius: 8, flex: 1, minWidth: 200 }}>
                          <input
                            type="radio"
                            name="spouseOption"
                            value="new"
                            checked={formData.spouseOption === "new"}
                            onChange={handleChange}
                            style={{ width: 18, height: 18, marginRight: 10, cursor: "pointer" }}
                          />
                          <div>
                            <span style={{ fontWeight: "600", color: "#1F2937", display: "block", fontSize: "0.9rem" }}>
                              ➕ Tambah Baru
                            </span>
                            <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                              Pasangan belum terdaftar
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Pilih dari Daftar */}
                    {formData.spouseOption === "existing" && (
                      <div>
                        <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 8 }}>
                          Pilih Pasangan <span style={{ color: "#DC2626" }}>*</span>
                        </label>
                        <select
                          name="spouseId"
                          value={formData.spouseId}
                          onChange={handleChange}
                          style={{ ...inputStyle, backgroundColor: "white" }}
                          required={formData.isMarried && formData.spouseOption === "existing"}
                        >
                          <option value="">-- Pilih Pasangan --</option>
                          {getPotentialSpouses().map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nama} ({p.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"})
                            </option>
                          ))}
                        </select>
                        {getPotentialSpouses().length === 0 && (
                          <p style={{ color: "#DC2626", fontSize: "0.85rem", marginTop: 8 }}>
                            ⚠️ Belum ada calon pasangan yang sesuai. Silakan pilih "Tambah Baru" untuk membuat data pasangan baru.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Tambah Pasangan Baru */}
                    {formData.spouseOption === "new" && (
                      <div style={{ background: "#F0FDF4", border: "2px solid #BBF7D0", borderRadius: 12, padding: 24 }}>
                        <h4 style={{ fontSize: "1rem", fontWeight: "700", color: "#166534", marginBottom: 16, display: "flex", alignItems: "center" }}>
                          <span style={{ marginRight: 8 }}>➕</span>
                          Data Pasangan Baru
                        </h4>
                        <p style={{ fontSize: "0.85rem", color: "#15803D", marginBottom: 20 }}>
                          Isi data pasangan yang belum terdaftar. Jenis kelamin akan otomatis disesuaikan (
                          {formData.jenisKelamin === "LAKI_LAKI" ? "Perempuan" : "Laki-laki"}
                          ).
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          <div>
                            <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 8 }}>
                              Nama Pasangan <span style={{ color: "#DC2626" }}>*</span>
                            </label>
                            <input
                              type="text"
                              name="nama"
                              value={newSpouseData.nama}
                              onChange={handleNewSpouseChange}
                              style={inputStyle}
                              placeholder={`Contoh: Jane ${formData.jenisKelamin === "LAKI_LAKI" ? "Simangunsong" : "Simangunsong"}`}
                              required={formData.isMarried && formData.spouseOption === "new"}
                            />
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                              <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 8 }}>
                                Tanggal Lahir
                              </label>
                              <input
                                type="date"
                                name="tanggalLahir"
                                value={newSpouseData.tanggalLahir}
                                onChange={handleNewSpouseChange}
                                style={inputStyle}
                              />
                            </div>

                            <div>
                              <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 8 }}>
                                Tempat Lahir
                              </label>
                              <input
                                type="text"
                                name="tempatLahir"
                                value={newSpouseData.tempatLahir}
                                onChange={handleNewSpouseChange}
                                style={inputStyle}
                                placeholder="Contoh: Medan"
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 8 }}>
                              URL Foto <span style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>(opsional)</span>
                            </label>
                            <input
                              type="url"
                              name="foto"
                              value={newSpouseData.foto}
                              onChange={handleNewSpouseChange}
                              style={inputStyle}
                              placeholder="https://example.com/foto-pasangan.jpg"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tanggal Menikah */}
                    <div>
                      <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 8 }}>
                        Tanggal Menikah
                      </label>
                      <input type="date" name="tanggalMenikah" value={formData.tanggalMenikah} onChange={handleChange} style={inputStyle} />
                    </div>
                  </>
                )}

                {!formData.isMarried && (
                  <div style={{ background: "#F3F4F6", border: "2px solid #E5E7EB", borderRadius: 12, padding: 20 }}>
                    <p style={{ color: "#4B5563", fontSize: "0.9rem", margin: 0 }}>
                      ℹ️ Status: Belum menikah. Anda bisa menambahkan informasi pernikahan nanti.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#1F2937", marginBottom: 8 }}>
                  👶 Anak-anak
                </h3>
                <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>
                  Tambahkan informasi anak-anak jika sudah memiliki
                </p>
              </div>

              {formData.isMarried ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={{ background: "#EFF6FF", border: "2px solid #DBEAFE", borderRadius: 12, padding: 20 }}>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        name="hasChildren"
                        checked={formData.hasChildren}
                        onChange={handleChange}
                        style={{ width: 20, height: 20, marginRight: 12, cursor: "pointer" }}
                      />
                      <span style={{ fontWeight: "600", color: "#1E40AF", fontSize: "0.95rem" }}>
                        👨‍👩‍👧‍👦 Pasangan ini memiliki anak
                      </span>
                    </label>
                  </div>

                  {formData.hasChildren && (
                    <div>
                      <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", color: "#374151", marginBottom: 12 }}>
                        Pilih Anak-anak (bisa lebih dari satu)
                      </label>
                      <div style={{
                        maxHeight: 300,
                        overflowY: "auto",
                        border: "2px solid #E5E7EB",
                        borderRadius: 8,
                        padding: 16,
                      }}>
                        {getAvailableChildren().length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {getAvailableChildren().map((person) => (
                              <label
                                key={person.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: 12,
                                  background: formData.childrenIds.includes(person.id) ? "#EFF6FF" : "white",
                                  border: formData.childrenIds.includes(person.id) ? "2px solid #3B82F6" : "2px solid #E5E7EB",
                                  borderRadius: 8,
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.childrenIds.includes(person.id)}
                                  onChange={() => handleChildToggle(person.id)}
                                  style={{ width: 18, height: 18, marginRight: 12, cursor: "pointer" }}
                                />
                                <span style={{ fontSize: "0.95rem", color: "#1F2937" }}>
                                  {person.nama} <span style={{ color: "#6B7280" }}>({person.jenisKelamin === "LAKI_LAKI" ? "👦 L" : "👧 P"})</span>
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: "#6B7280", fontSize: "0.9rem", textAlign: "center" }}>
                            Belum ada person yang bisa ditambahkan sebagai anak
                          </p>
                        )}
                      </div>
                      {formData.childrenIds.length > 0 && (
                        <p style={{ color: "#059669", fontSize: "0.9rem", marginTop: 12, fontWeight: "600" }}>
                          ✓ {formData.childrenIds.length} anak dipilih
                        </p>
                      )}
                    </div>
                  )}

                  {/* Summary */}
                  <div style={{ background: "#ECFDF5", border: "2px solid #A7F3D0", borderRadius: 12, padding: 24 }}>
                    <p style={{ fontWeight: "700", color: "#047857", fontSize: "1rem", marginBottom: 16 }}>
                      📋 Ringkasan Data
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, color: "#065F46", fontSize: "0.9rem" }}>
                      <p style={{ margin: 0 }}>• Nama: <strong>{formData.nama || "-"}</strong></p>
                      <p style={{ margin: 0 }}>• Jenis Kelamin: <strong>{formData.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</strong></p>
                      <p style={{ margin: 0 }}>• Dari Orang Tua: <strong>{formData.hasParents ? "Ya" : "Tidak"}</strong></p>
                      <p style={{ margin: 0 }}>• Status Pernikahan: <strong>{formData.isMarried ? "Sudah menikah" : "Belum menikah"}</strong></p>
                      {formData.isMarried && (
                        <>
                          <p style={{ margin: 0 }}>
                            • Pasangan: <strong>
                              {formData.spouseOption === "existing" 
                                ? (persons.find(p => p.id === parseInt(formData.spouseId))?.nama || "-")
                                : `${newSpouseData.nama || "-"} (Baru)`
                              }
                            </strong>
                          </p>
                          <p style={{ margin: 0 }}>• Jumlah Anak: <strong>{formData.childrenIds.length}</strong></p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: "#FEF3C7", border: "2px solid #FDE68A", borderRadius: 12, padding: 24 }}>
                  <p style={{ color: "#92400E", fontSize: "0.95rem", margin: 0 }}>
                    ℹ️ Informasi anak hanya tersedia untuk orang yang sudah menikah. Silakan kembali ke Step 3 untuk menambahkan informasi pernikahan.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error & Success */}
          {error && (
            <div style={{ marginTop: 24, background: "#FEE2E2", border: "2px solid #FECACA", borderRadius: 8, padding: 16 }}>
              <p style={{ color: "#DC2626", fontSize: "0.9rem", margin: 0, fontWeight: "600" }}>
                ❌ {error}
              </p>
            </div>
          )}

          {success && (
            <div style={{ marginTop: 24, background: "#D1FAE5", border: "2px solid #A7F3D0", borderRadius: 8, padding: 16 }}>
              <p style={{ color: "#059669", fontSize: "0.9rem", margin: 0, fontWeight: "600" }}>
                {success}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: 12, marginTop: 32, paddingTop: 24, borderTop: "2px solid #E5E7EB" }}>
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                style={{
                  padding: "12px 24px",
                  background: "#F3F4F6",
                  color: "#374151",
                  border: "none",
                  borderRadius: 8,
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                ← Kembali
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={loading || (step === 1 && !formData.nama)}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: "#8B1A1A",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  cursor: loading || (step === 1 && !formData.nama) ? "not-allowed" : "pointer",
                  opacity: loading || (step === 1 && !formData.nama) ? 0.5 : 1,
                }}
              >
                Lanjut →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? "Menyimpan..." : "✓ Simpan Semua Data"}
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                style={{
                  padding: "12px 24px",
                  background: "#F3F4F6",
                  color: "#374151",
                  border: "none",
                  borderRadius: 8,
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
