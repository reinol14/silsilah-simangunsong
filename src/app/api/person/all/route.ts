// app/api/person/all/route.ts
// Mengembalikan semua person diurutkan berdasarkan posisi silsilah (tertua di atas)

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
      prisma.child.findMany({
        select: { marriageId: true, personId: true, urutanAnak: true },
      }),
      prisma.marriage.findMany({
        select: { id: true, husbandId: true, wifeId: true },
      }),
    ]);

    // ── Build lookup maps ──────────────────────────────────────────────────
    // personId → { marriageId, urutanAnak } (sebagai anak)
    const childOfMap = new Map<number, { marriageId: number; urutanAnak: number | null }>();
    for (const c of allChildren) childOfMap.set(c.personId, { marriageId: c.marriageId, urutanAnak: c.urutanAnak });

    // marriageId → husbandId
    const marriageToHusband = new Map<number, number>();
    for (const m of allMarriages) marriageToHusband.set(m.id, m.husbandId);

    // wifeId → husbandId  (istri → suami, untuk inherit generasi)
    const wifeToHusband = new Map<number, number>();
    for (const m of allMarriages) wifeToHusband.set(m.wifeId, m.husbandId);

    // husbandId → [wifeId, ...]
    const husbandToWives = new Map<number, number[]>();
    for (const m of allMarriages) {
      if (!husbandToWives.has(m.husbandId)) husbandToWives.set(m.husbandId, []);
      husbandToWives.get(m.husbandId)!.push(m.wifeId);
    }

    // Set semua wifeId
    const wifeIds = new Set(allMarriages.map(m => m.wifeId));

    // ── Hitung generasi berdasarkan garis keturunan ────────────────────────
    function getDepth(personId: number, visited = new Set<number>()): number {
      if (visited.has(personId)) return 0;
      visited.add(personId);

      const child = childOfMap.get(personId);
      if (child === undefined) return 0; // root / tidak punya ayah di DB

      const fatherId = marriageToHusband.get(child.marriageId);
      if (fatherId === undefined) return 0;

      return 1 + getDepth(fatherId, visited);
    }

    // ── Assign generasi ke semua person ───────────────────────────────────
    const depthMap = new Map<number, number>();

    // Pass 1: hitung semua orang yang punya data orang tua di tabel Child
    // (termasuk perempuan yang juga tercatat sebagai istri)
    for (const p of allPersons) {
      if (childOfMap.has(p.id)) {
        depthMap.set(p.id, getDepth(p.id));
      }
    }

    // Pass 2: istri tanpa data orang tua → ikut generasi suami
    // Loop beberapa kali untuk handle suami yang belum dihitung
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

    // Pass 3: suami eksternal (tidak punya data orang tua, bukan istri)
    // → ikut generasi istri yang sudah punya generasi (misal: menantu dari marga lain)
    for (let pass = 0; pass < 3; pass++) {
      for (const p of allPersons) {
        if (!wifeIds.has(p.id) && !depthMap.has(p.id)) {
          const wives = husbandToWives.get(p.id) ?? [];
          for (const wifeId of wives) {
            if (depthMap.has(wifeId)) {
              depthMap.set(p.id, depthMap.get(wifeId)!);
              break;
            }
          }
        }
      }
    }

    // Fallback: jika masih belum dapat generasi (benar-benar tidak ada data relasi)
    for (const p of allPersons) {
      if (!depthMap.has(p.id)) depthMap.set(p.id, 0);
    }

    // ── Sort: DFS tree traversal agar anak-anak dari ayah yang sama berkelompok ──
    // diurutkan berdasarkan urutanAnak, lalu tanggalLahir, lalu createdAt

    const personById = new Map(allPersons.map(p => [p.id, p]));

    // ayahId → [anakId, ...] diurutkan berdasarkan urutanAnak / tanggalLahir / createdAt
    const fatherToChildren = new Map<number, number[]>();
    for (const p of allPersons) {
      if (wifeIds.has(p.id)) continue;
      const child = childOfMap.get(p.id);
      if (!child) continue;
      const fatherId = marriageToHusband.get(child.marriageId);
      if (!fatherId || !personById.has(fatherId)) continue;
      if (!fatherToChildren.has(fatherId)) fatherToChildren.set(fatherId, []);
      fatherToChildren.get(fatherId)!.push(p.id);
    }

    // Urutkan anak-anak tiap ayah berdasarkan urutanAnak, fallback tanggalLahir/createdAt
    for (const children of fatherToChildren.values()) {
      children.sort((a, b) => {
        const ca = childOfMap.get(a);
        const cb = childOfMap.get(b);
        const ua = ca?.urutanAnak ?? null;
        const ub = cb?.urutanAnak ?? null;
        // Jika keduanya punya urutanAnak, pakai itu
        if (ua !== null && ub !== null) return ua - ub;
        // Jika salah satu punya urutanAnak, yang punya didahulukan
        if (ua !== null) return -1;
        if (ub !== null) return 1;
        // Fallback ke tanggalLahir / createdAt
        const pa = personById.get(a)!;
        const pb = personById.get(b)!;
        const ta = pa.tanggalLahir ? new Date(pa.tanggalLahir).getTime() : new Date(pa.createdAt).getTime();
        const tb = pb.tanggalLahir ? new Date(pb.tanggalLahir).getTime() : new Date(pb.createdAt).getTime();
        return ta - tb;
      });
    }

    // DFS: suami → istri (langsung setelah suami) → anak-anak (rekursif)
    const visitedDfs = new Set<number>();
    const sortedIds: number[] = [];

    function dfs(personId: number) {
      if (visitedDfs.has(personId)) return;
      visitedDfs.add(personId);
      sortedIds.push(personId);
      // Sisipkan istri langsung setelah suami
      for (const wifeId of (husbandToWives.get(personId) ?? [])) {
        if (!visitedDfs.has(wifeId) && personById.has(wifeId)) {
          visitedDfs.add(wifeId);
          sortedIds.push(wifeId);
        }
      }
      // Lalu anak-anak (rekursif)
      for (const childId of (fatherToChildren.get(personId) ?? [])) {
        dfs(childId);
      }
    }

    // Tentukan root: tidak punya data orang tua di tree saat ini
    const roots = allPersons
      .filter(p => {
        if (wifeIds.has(p.id)) return false;
        const child = childOfMap.get(p.id);
        if (!child) return true;
        const fatherId = marriageToHusband.get(child.marriageId);
        return !fatherId || !personById.has(fatherId);
      })
      .sort((a, b) => {
        const da = depthMap.get(a.id) ?? 0;
        const db = depthMap.get(b.id) ?? 0;
        if (da !== db) return da - db;
        const ta = a.tanggalLahir ? new Date(a.tanggalLahir).getTime() : new Date(a.createdAt).getTime();
        const tb = b.tanggalLahir ? new Date(b.tanggalLahir).getTime() : new Date(b.createdAt).getTime();
        return ta - tb;
      });

    for (const root of roots) dfs(root.id);

    // Fallback: tambahkan siapa pun yang belum masuk (seharusnya tidak terjadi)
    for (const p of allPersons) {
      if (!visitedDfs.has(p.id)) sortedIds.push(p.id);
    }

    const sorted = sortedIds.map(id => personById.get(id)!).filter(Boolean);

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
