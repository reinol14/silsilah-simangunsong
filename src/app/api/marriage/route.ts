// app/api/marriage/route.ts
// GET  /api/marriage → semua pernikahan (untuk dropdown orang tua)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const marriages = await prisma.marriage.findMany({
      include: {
        husband: {
          select: { id: true, nama: true, foto: true },
        },
        wife: {
          select: { id: true, nama: true, foto: true },
        },
        children: {
          include: {
            person: {
              select: { id: true, nama: true },
            },
          },
          orderBy: [
            { urutanAnak: "asc" } as any,
            { id: "asc" },
          ],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: marriages });
  } catch (error) {
    console.error("GET /api/marriage error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data pernikahan" },
      { status: 500 }
    );
  }
}
