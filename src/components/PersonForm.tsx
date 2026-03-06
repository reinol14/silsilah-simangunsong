"use client";

import { useState } from "react";

interface PersonFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PersonForm({ onSuccess, onCancel }: PersonFormProps) {
  const [formData, setFormData] = useState({
    nama: "",
    jenisKelamin: "LAKI_LAKI" as "LAKI_LAKI" | "PEREMPUAN",
    tanggalLahir: "",
    tanggalWafat: "",
    tempatLahir: "",
    foto: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama.trim()) {
      setError("Nama wajib diisi");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/person", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: formData.nama.trim(),
          jenisKelamin: formData.jenisKelamin,
          tanggalLahir: formData.tanggalLahir || null,
          tanggalWafat: formData.tanggalWafat || null,
          tempatLahir: formData.tempatLahir.trim() || null,
          foto: formData.foto.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan data");
      }

      setSuccess("Data berhasil disimpan!");
      // Reset form
      setFormData({
        nama: "",
        jenisKelamin: "LAKI_LAKI",
        tanggalLahir: "",
        tanggalWafat: "",
        tempatLahir: "",
        foto: "",
      });

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 border-2 border-[#C9A84C]">
      <h2 className="text-2xl font-bold mb-6 text-[#8B1A1A]">
        Tambah Anggota Keluarga
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama */}
        <div>
          <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nama"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
            placeholder="Masukkan nama lengkap"
            required
          />
        </div>

        {/* Jenis Kelamin */}
        <div>
          <label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Kelamin <span className="text-red-500">*</span>
          </label>
          <select
            id="jenisKelamin"
            name="jenisKelamin"
            value={formData.jenisKelamin}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
            required
          >
            <option value="LAKI_LAKI">Laki-laki</option>
            <option value="PEREMPUAN">Perempuan</option>
          </select>
        </div>

        {/* Tanggal Lahir */}
        <div>
          <label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Lahir
          </label>
          <input
            type="date"
            id="tanggalLahir"
            name="tanggalLahir"
            value={formData.tanggalLahir}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
          />
        </div>

        {/* Tempat Lahir */}
        <div>
          <label htmlFor="tempatLahir" className="block text-sm font-medium text-gray-700 mb-1">
            Tempat Lahir
          </label>
          <input
            type="text"
            id="tempatLahir"
            name="tempatLahir"
            value={formData.tempatLahir}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
            placeholder="Contoh: Jakarta"
          />
        </div>

        {/* Tanggal Wafat */}
        <div>
          <label htmlFor="tanggalWafat" className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Wafat (opsional)
          </label>
          <input
            type="date"
            id="tanggalWafat"
            name="tanggalWafat"
            value={formData.tanggalWafat}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
          />
        </div>

        {/* URL Foto */}
        <div>
          <label htmlFor="foto" className="block text-sm font-medium text-gray-700 mb-1">
            URL Foto (opsional)
          </label>
          <input
            type="url"
            id="foto"
            name="foto"
            value={formData.foto}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
            placeholder="https://example.com/foto.jpg"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-[#8B1A1A] text-white rounded-md hover:bg-[#5C0E0E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Batal
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
