// PUT  /api/person/[id]  → update data person (auth required)
// DELETE /api/person/[id] → hapus person + relasi (auth required)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
    const personId = parseInt(id);
    if (isNaN(personId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { nama, jenisKelamin, tanggalLahir, tanggalWafat, tempatLahir, foto, bio } = body;

    if (!nama || !jenisKelamin) {
      return NextResponse.json(
        { success: false, message: "Nama dan jenis kelamin wajib diisi" },
        { status: 400 }
      );
    }

    const person = await prisma.person.update({
      where: { id: personId },
      data: {
        nama,
        jenisKelamin,
        tanggalLahir:  tanggalLahir  ? new Date(tanggalLahir)  : null,
        tanggalWafat:  tanggalWafat  ? new Date(tanggalWafat)  : null,
        tempatLahir:   tempatLahir   || null,
        foto:          foto          || null,
        bio:           bio           || null,
      } as any,
    });

    return NextResponse.json({ success: true, data: person });
  } catch (error) {
    console.error("PUT /api/person/[id] error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengupdate data" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const personId = parseInt(id);
    if (isNaN(personId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    // Hapus dalam transaksi untuk menjaga integritas data
    await prisma.$transaction(async (tx) => {
      // 1. Hapus record Child di mana person ini adalah anaknya
      await tx.child.deleteMany({ where: { personId } });

      // 2. Cari semua pernikahan yang melibatkan person ini
      const marriages = await tx.marriage.findMany({
        where: { OR: [{ husbandId: personId }, { wifeId: personId }] },
        select: { id: true },
      });
      const marriageIds = marriages.map((m) => m.id);

      // 3. Hapus Child dari pernikahan tersebut, lalu hapus pernikahannya
      if (marriageIds.length > 0) {
        await tx.child.deleteMany({ where: { marriageId: { in: marriageIds } } });
        await tx.marriage.deleteMany({ where: { id: { in: marriageIds } } });
      }

      // 4. Hapus person
      await tx.person.delete({ where: { id: personId } });
    });

    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/person/[id] error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus data" }, { status: 500 });
  }
}
