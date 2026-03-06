import Link from "next/link"

export default function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-black text-white flex flex-col">

      {/* Header */}
      <div className="p-6 border-b border-red-700">
        <h1 className="text-xl font-bold text-red-500">
          SIMANGUNSONG
        </h1>
        <p className="text-sm text-gray-400">
          Tarombo Digital
        </p>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-4 p-6 text-sm">

        <Link href="/dashboard" className="hover:text-red-400">
          🏠 Dashboard
        </Link>

        <Link href="/anggota" className="hover:text-red-400">
          👥 Anggota
        </Link>

        <Link href="/silsilah" className="hover:text-red-400">
          🌳 Pohon Silsilah
        </Link>

      </nav>

      {/* Ornamen gorga */}
      <div
        className="mt-auto h-32"
        style={{
          backgroundImage: "url('/gorga.png')",
          backgroundSize: "cover",
        }}
      />

    </div>
  )
}