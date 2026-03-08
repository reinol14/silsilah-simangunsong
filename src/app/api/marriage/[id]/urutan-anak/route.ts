// GET  /api/marriage/[id]/urutan-anak → daftar anak dalam pernikahan beserta urutan
// PUT  /api/marriage/[id]/urutan-anak → update urutan anak (array of { childId, urutanAnak })

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const marriageId = parseInt(id);
    if (isNaN(marriageId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const marriage = await prisma.marriage.findUnique({
      where: { id: marriageId },
      include: {
        husband: { select: { id: true, nama: true } },
        wife:    { select: { id: true, nama: true } },
        children: {
          include: { person: { select: { id: true, nama: true, jenisKelamin: true, tanggalLahir: true } } },
          orderBy: [{ urutanAnak: "asc" } as any, { id: "asc" }],
        },
      },
    });

    if (!marriage) {
      return NextResponse.json({ success: false, message: "Pernikahan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: marriage });
  } catch (error) {
    console.error("GET /api/marriage/[id]/urutan-anak error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const marriageId = parseInt(id);
    if (isNaN(marriageId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    // body: [{ childId: number, urutanAnak: number }, ...]
    const updates: { childId: number; urutanAnak: number }[] = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json({ success: false, message: "Format data tidak valid" }, { status: 400 });
    }

    // Update setiap child
    await prisma.$transaction(
      updates.map(({ childId, urutanAnak }) =>
        (prisma.child as any).update({
          where: { id: childId },
          data: { urutanAnak },
        })
      )
    );

    return NextResponse.json({ success: true, message: "Urutan anak berhasil diperbarui" });
  } catch (error) {
    console.error("PUT /api/marriage/[id]/urutan-anak error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengupdate urutan" }, { status: 500 });
  }
}
