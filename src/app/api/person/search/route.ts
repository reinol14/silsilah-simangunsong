import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (q.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const persons = await prisma.person.findMany({
      where: {
        OR: [
          { nama:        { contains: q } },
          { tempatLahir: { contains: q } },
        ],
      },
      include: {
        children: {
          include: {
            marriage: {
              include: { husband: true, wife: true },
            },
          },
        },
        marriagesAsHusband: {
          include: { wife: true },
        },
        marriagesAsWife: {
          include: { husband: true },
        },
      },
      orderBy: { nama: "asc" },
      take: 30,
    });

    const data = persons.map(p => {
      // Cari nama orang tua
      let namaOrangTua: string | null = null;
      if (p.children.length > 0) {
        const m = p.children[0].marriage;
        if (m) namaOrangTua = `${m.husband.nama} & ${m.wife.nama}`;
      }

      // Cari nama pasangan
      let namaPasangan: string | null = null;
      if (p.marriagesAsHusband.length > 0) {
        namaPasangan = p.marriagesAsHusband[0].wife.nama;
      } else if (p.marriagesAsWife.length > 0) {
        namaPasangan = p.marriagesAsWife[0].husband.nama;
      }

      return {
        id:           p.id,
        nama:         p.nama,
        jenisKelamin: p.jenisKelamin,
        foto:         p.foto,
        tanggalLahir: p.tanggalLahir,
        tanggalWafat: p.tanggalWafat,
        tempatLahir:  p.tempatLahir,
        namaOrangTua,
        namaPasangan,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/person/search error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mencari data" },
      { status: 500 }
    );
  }
}
