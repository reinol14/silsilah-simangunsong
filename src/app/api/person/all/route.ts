// app/api/person/all/route.ts
// Mengembalikan semua person diurutkan berdasarkan posisi silsilah (tertua di atas)
// FIXED: istri mengikuti generasi suaminya, bukan dihitung sendiri

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cari   = searchParams.get("cari")   || "";
    const gender = searchParams.get("gender") || "";

    // Ambil semua data sekaligus
    const [allPersons, allChildren, allMarriages] = await Promise.all([
      prisma.person.findMany({
        where: {
          AND: [
            cari   ? { nama: { contains: cari } } : {},
            gender ? { jenisKelamin: gender as any } : {},
          ],
        },
        include: {
          marriagesAsHusband: {
            include: {
              wife:     { select: { id: true, nama: true } },
              children: { include: { person: { select: { id: true, nama: true } } } },
            },
          },
          marriagesAsWife: {
            include: {
              husband: { select: { id: true, nama: true } },
            },
          },
        },
      }),
      prisma.child.findMany(),
      prisma.marriage.findMany({
        select: { id: true, husbandId: true, wifeId: true },
      }),
    ]);

    // ── Build lookup maps ──────────────────────────────────────────────────
    // personId → marriageId (sebagai anak)
    const childOfMap = new Map<number, number>();
    for (const c of allChildren) childOfMap.set(c.personId, c.marriageId);

    // marriageId → husbandId
    const marriageToHusband = new Map<number, number>();
    for (const m of allMarriages) marriageToHusband.set(m.id, m.husbandId);

    // wifeId → husbandId  (istri → suami, untuk inherit generasi)
    const wifeToHusband = new Map<number, number>();
    for (const m of allMarriages) wifeToHusband.set(m.wifeId, m.husbandId);

    // Set semua wifeId
    const wifeIds = new Set(allMarriages.map(m => m.wifeId));

    // ── Hitung generasi berdasarkan garis keturunan patrilineal ───────────
    // Hanya dihitung untuk orang yang BUKAN istri (atau yang memang anak asli di tabel child)
    function getDepth(personId: number, visited = new Set<number>()): number {
      if (visited.has(personId)) return 0;
      visited.add(personId);

      const marriageId = childOfMap.get(personId);
      if (marriageId === undefined) return 0; // root / tidak punya ayah di DB

      const fatherId = marriageToHusband.get(marriageId);
      if (fatherId === undefined) return 0;

      return 1 + getDepth(fatherId, visited);
    }

    // ── Assign generasi ke semua person ───────────────────────────────────
    const depthMap = new Map<number, number>();

    // Pass 1: hitung semua orang yang bukan istri dulu
    for (const p of allPersons) {
      if (!wifeIds.has(p.id)) {
        depthMap.set(p.id, getDepth(p.id));
      }
    }

    // Pass 2: istri mengikuti generasi suaminya
    // Loop beberapa kali untuk handle kasus suami belum dihitung (urutan tidak tentu)
    for (let pass = 0; pass < 3; pass++) {
      for (const p of allPersons) {
        if (wifeIds.has(p.id) && !depthMap.has(p.id)) {
          const husbandId = wifeToHusband.get(p.id);
          if (husbandId !== undefined && depthMap.has(husbandId)) {
            depthMap.set(p.id, depthMap.get(husbandId)!);
          }
        }
      }
    }

    // Fallback: jika istri masih belum dapat generasi (suami tidak ada di DB)
    for (const p of allPersons) {
      if (!depthMap.has(p.id)) depthMap.set(p.id, 0);
    }

    // ── Sort: generasi asc → createdAt asc ────────────────────────────────
    const sorted = [...allPersons].sort((a, b) => {
      const da = depthMap.get(a.id) ?? 0;
      const db = depthMap.get(b.id) ?? 0;
      if (da !== db) return da - db;
      // Dalam satu generasi: suami dulu baru istri
      const aIsWife = wifeIds.has(a.id) ? 1 : 0;
      const bIsWife = wifeIds.has(b.id) ? 1 : 0;
      if (aIsWife !== bIsWife) return aIsWife - bIsWife;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // ── Build result ───────────────────────────────────────────────────────
    const result = sorted.map(p => ({
      ...p,
      generasi:   depthMap.get(p.id) ?? 0,
      isIstri:    wifeIds.has(p.id),
      pasangan:   p.marriagesAsHusband[0]?.wife || p.marriagesAsWife[0]?.husband || null,
      jumlahAnak: p.marriagesAsHusband.reduce((s, m) => s + m.children.length, 0),
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("GET /api/person/all error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data" }, { status: 500 });
  }
}