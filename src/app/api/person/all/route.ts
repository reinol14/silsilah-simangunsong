// app/api/person/all/route.ts
// Mengembalikan semua person diurutkan berdasarkan posisi silsilah (tertua di atas)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cari   = searchParams.get("cari")   || "";
    const gender = searchParams.get("gender") || "";

    // PERBAIKAN: Ambil SEMUA person untuk perhitungan generasi yang benar
    // Filter akan diterapkan di akhir untuk hasil
    const [allPersons, allChildren, allMarriages] = await Promise.all([
      prisma.person.findMany({
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
    
    // marriageId → wifeId
    const marriageToWife = new Map<number, number>();
    for (const m of allMarriages) marriageToWife.set(m.id, m.wifeId);

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
    const depthMap = new Map<number, number>();

    function getDepth(personId: number, visited = new Set<number>()): number {
      // Jika sudah ada di depthMap, pakai itu (sudah dihitung atau dari spouse inheritance)
      if (depthMap.has(personId)) return depthMap.get(personId)!;
      
      if (visited.has(personId)) return 0;
      visited.add(personId);

      const child = childOfMap.get(personId);
      if (child === undefined) return 0; // root / tidak punya parent di DB

      const fatherId = marriageToHusband.get(child.marriageId);
      const motherId = marriageToWife.get(child.marriageId);
      
      // Cek apakah ayah adalah keturunan Simangunsong (ada di childOfMap)
      const fatherIsDescendant = fatherId !== undefined && childOfMap.has(fatherId);
      
      // Cek apakah ibu adalah keturunan Simangunsong (ada di childOfMap)
      const motherIsDescendant = motherId !== undefined && childOfMap.has(motherId);
      
      // PRIORITAS: Gunakan jalur yang valid (keturunan Simangunsong)
      
      // Kasus 1: Ayah adalah keturunan Simangunsong
      if (fatherIsDescendant) {
        return 1 + getDepth(fatherId, visited);
      }
      
      // Kasus 2: Ayah bukan keturunan, tapi ibu adalah keturunan Simangunsong
      // (Ayah adalah external husband, anak mengikuti garis ibu)
      if (motherIsDescendant) {
        return 1 + getDepth(motherId, visited);
      }
      
      // Kasus 3: Tidak ada ayah/ibu yang keturunan
      // Ini adalah anak dari founding couple (ayah & ibu keduanya root/generasi 0)
      if (fatherId !== undefined) {
        return 1 + getDepth(fatherId, visited);
      }
      
      // Fallback: tidak ada jalur valid
      return 0;
    }

    // ── Assign generasi ke semua person ───────────────────────────────────
    // Loop beberapa kali untuk handle dependencies antara child calculation dan spouse inheritance
    for (let iteration = 0; iteration < 5; iteration++) {
      // Pass A: Hitung generasi untuk semua person dengan childOfMap (adalah anak dari seseorang)
      for (const p of allPersons) {
        if (childOfMap.has(p.id) && !depthMap.has(p.id)) {
          const depth = getDepth(p.id, new Set());
          // Set generasi untuk semua anak, termasuk yang depth === 0 (anak dari root)
          depthMap.set(p.id, depth);
        }
      }

      // Pass B: Istri mengikuti suami
      for (const p of allPersons) {
        if (wifeIds.has(p.id) && !depthMap.has(p.id)) {
          const husbandId = wifeToHusband.get(p.id);
          if (husbandId !== undefined && depthMap.has(husbandId)) {
            depthMap.set(p.id, depthMap.get(husbandId)!);
          }
        }
      }
      
      // Pass C: Suami mengikuti istri (untuk kasus suami dari marga lain)
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

    // Fallback untuk orphans (tidak punya parent dan tidak punya spouse dengan generasi)
    // Mereka adalah root generation (generasi 0)
    for (const p of allPersons) {
      if (!depthMap.has(p.id)) {
        depthMap.set(p.id, 0); // Root generation
      }
    }

    // ── Sort: DFS tree traversal agar anak-anak dari ayah yang sama berkelompok ──
    // diurutkan berdasarkan urutanAnak, lalu tanggalLahir, lalu createdAt

    const personById = new Map(allPersons.map(p => [p.id, p]));

    // ayahId → [anakId, ...] diurutkan berdasarkan urutanAnak / tanggalLahir / createdAt
    const fatherToChildren = new Map<number, number[]>();
    for (const p of allPersons) {
      if (wifeIds.has(p.id)) continue; // Skip wives
      const child = childOfMap.get(p.id);
      if (!child) continue;
      const fatherId = marriageToHusband.get(child.marriageId);
      if (!fatherId || !personById.has(fatherId)) continue;
      if (!fatherToChildren.has(fatherId)) fatherToChildren.set(fatherId, []);
      fatherToChildren.get(fatherId)!.push(p.id);
    }
    
    // Tambahan: motherToChildren untuk anak perempuan Simangunsong (keturunan langsung)
    // yang menikah dengan external husband
    const motherToChildren = new Map<number, number[]>();
    for (const p of allPersons) {
      if (wifeIds.has(p.id)) continue; // Skip (ini adalah anak, bukan istri)
      const child = childOfMap.get(p.id);
      if (!child) continue;
      const fatherId = marriageToHusband.get(child.marriageId);
      if (!fatherId) continue;
      // Cari ibu (istri dari ayah) yang adalah keturunan Simangunsong
      const motherId = marriageToWife.get(child.marriageId);
      if (motherId && childOfMap.has(motherId)) {
        // Ibu adalah keturunan Simangunsong
        if (!motherToChildren.has(motherId)) motherToChildren.set(motherId, []);
        motherToChildren.get(motherId)!.push(p.id);
      }
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
    
    // Urutkan anak-anak tiap ibu (untuk motherToChildren) dengan cara yang sama
    for (const children of motherToChildren.values()) {
      children.sort((a, b) => {
        const ca = childOfMap.get(a);
        const cb = childOfMap.get(b);
        const ua = ca?.urutanAnak ?? null;
        const ub = cb?.urutanAnak ?? null;
        if (ua !== null && ub !== null) return ua - ub;
        if (ua !== null) return -1;
        if (ub !== null) return 1;
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
      
      // Jika laki-laki Simangunsong, sisipkan istri-istrinya
      const wives = husbandToWives.get(personId) ?? [];
      for (const wifeId of wives) {
        if (!visitedDfs.has(wifeId) && personById.has(wifeId)) {
          visitedDfs.add(wifeId);
          sortedIds.push(wifeId);
        }
      }
      
      // Traverse anak-anak (dari laki-laki ini sebagai ayah)
      for (const childId of (fatherToChildren.get(personId) ?? [])) {
        dfs(childId);
      }
      
      // Jika ini adalah anak perempuan Simangunsong (keturunan langsung),
      // traverse anak-anaknya langsung tanpa melalui suami external
      if (wifeIds.has(personId) && childOfMap.has(personId)) {
        const children = motherToChildren.get(personId) ?? [];
        for (const childId of children) {
          dfs(childId);
        }
      }
    }

    // Tentukan root: orang yang tidak punya data orang tua di tree saat ini
    // (bukan istri, tidak punya parent marriage)
    // Exclude external husbands (suami yang dapat generasi dari istri, bukan dari ancestry)
    const roots = allPersons
      .filter(p => {
        if (wifeIds.has(p.id)) return false; // Wives are handled with their husbands
        const child = childOfMap.get(p.id);
        if (!child) {
          // No parent - tapi pastikan ini bukan external husband
          // External husband = tidak ada di childOfMap dan bukan generasi 0
          const isExternalHusband = !childOfMap.has(p.id) && depthMap.get(p.id) !== 0;
          return !isExternalHusband; // Hanya jadikan root jika bukan external husband
        }
        const fatherId = marriageToHusband.get(child.marriageId);
        return !fatherId || !personById.has(fatherId); // Parent not in dataset = root
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
    let result = sorted.map(p => ({
      ...p,
      generasi:   depthMap.get(p.id) ?? 0,
      isIstri:    wifeIds.has(p.id),
      // PERBAIKAN POLIGAMI: Return array semua pasangan (bisa lebih dari 1)
      pasangan:   p.marriagesAsHusband.length > 0 
                    ? p.marriagesAsHusband.map(m => m.wife)
                    : (p.marriagesAsWife[0]?.husband ? [p.marriagesAsWife[0].husband] : []),
      jumlahAnak: p.marriagesAsHusband.reduce((s, m) => s + m.children.length, 0),
    }));

    // ── Apply search filters AFTER generasi calculation ───────────────────
    // Ini memastikan generasi tetap konsisten meski ada filter
    if (cari || gender) {
      result = result.filter(p => {
        const matchName = !cari || p.nama.toLowerCase().includes(cari.toLowerCase());
        const matchGender = !gender || p.jenisKelamin === gender;
        return matchName && matchGender;
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("GET /api/person/all error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data" }, { status: 500 });
  }
}
