// app/api/stats/route.ts
// Dipakai landing page untuk menampilkan statistik real dari database

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [totalPerson, totalMarriage, totalAnak] = await Promise.all([
      prisma.person.count(),
      prisma.marriage.count(),
      prisma.child.count(),
    ]);

    // Hitung laki-laki dan perempuan
    const [lakiLaki, perempuan] = await Promise.all([
      prisma.person.count({ where: { jenisKelamin: "LAKI_LAKI" } }),
      prisma.person.count({ where: { jenisKelamin: "PEREMPUAN" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalPerson,
        totalMarriage,
        totalAnak,
        lakiLaki,
        perempuan,
      },
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil statistik" }, { status: 500 });
  }
}
