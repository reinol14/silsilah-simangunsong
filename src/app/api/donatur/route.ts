import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/donatur — public (hanya tampilkan=true), atau ?all=1 untuk admin
export async function GET(req: NextRequest) {
  try {
    const all = req.nextUrl.searchParams.get("all") === "1";
    // Jika all=1, validasi session dulu
    if (all) {
      const session = await getSession();
      if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const data = await prisma.donatur.findMany({
      where: all ? {} : { tampilkan: true },
      orderBy: { tanggal: "desc" },
    });
    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal memuat data" }, { status: 500 });
  }
}

// POST /api/donatur — admin only
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { nama, nominal, pesan, tanggal, tampilkan } = body;

    if (!nama || !nominal || !tanggal) {
      return NextResponse.json({ success: false, message: "Nama, nominal, dan tanggal wajib diisi" }, { status: 400 });
    }

    const donatur = await prisma.donatur.create({
      data: {
        nama: String(nama),
        nominal: Number(nominal),
        pesan: pesan ? String(pesan) : null,
        tanggal: new Date(tanggal),
        tampilkan: tampilkan !== false,
      },
    });

    return NextResponse.json({ success: true, data: donatur }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal menyimpan data" }, { status: 500 });
  }
}
