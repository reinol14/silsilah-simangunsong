import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PUT /api/donatur/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { nama, nominal, pesan, tanggal, tampilkan } = body;

    const donatur = await prisma.donatur.update({
      where: { id: Number(id) },
      data: {
        ...(nama !== undefined && { nama: String(nama) }),
        ...(nominal !== undefined && { nominal: Number(nominal) }),
        ...(pesan !== undefined && { pesan: pesan ? String(pesan) : null }),
        ...(tanggal !== undefined && { tanggal: new Date(tanggal) }),
        ...(tampilkan !== undefined && { tampilkan: Boolean(tampilkan) }),
      },
    });

    return NextResponse.json({ success: true, data: donatur });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal memperbarui data" }, { status: 500 });
  }
}

// DELETE /api/donatur/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.donatur.delete({ where: { id: Number(id) } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal menghapus data" }, { status: 500 });
  }
}
