// app/api/tarombo/route.ts
// Mengembalikan seluruh pohon silsilah dalam format tree
// yang siap dirender di halaman Tarombo

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Ambil semua marriage beserta suami, istri, dan anak-anak
    const marriages = await prisma.marriage.findMany({
      include: {
        husband: true,
        wife:    true,
        children: {
          include: {
            person: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    // Ambil semua person untuk referensi lengkap
    const allPersons = await prisma.person.findMany({
      orderBy: { id: "asc" },
    });

    // Bangun struktur tree:
    // Cari siapa yang tidak punya ayah/ibu (root)
    const personIdsAsChild = new Set(
      (await prisma.child.findMany()).map((c) => c.personId)
    );

    // Root persons = yang tidak muncul sebagai anak di tabel child
    const rootPersons = allPersons.filter((p) => !personIdsAsChild.has(p.id));

    return NextResponse.json({
      success: true,
      data: {
        marriages,
        allPersons,
        rootPersons,
      },
    });
  } catch (error) {
    console.error("GET /api/tarombo error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data tarombo" }, { status: 500 });
  }
}
