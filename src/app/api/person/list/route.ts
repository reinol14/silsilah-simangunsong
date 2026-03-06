// app/api/person/list/route.ts
// GET  /api/person/list → semua person (simple, untuk dropdown)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const persons = await prisma.person.findMany({
      select: {
        id: true,
        nama: true,
        jenisKelamin: true,
        foto: true,
        tanggalLahir: true,
        tempatLahir: true,
      },
      orderBy: { nama: "asc" },
    });

    return NextResponse.json({ success: true, data: persons });
  } catch (error) {
    console.error("GET /api/person/list error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}
