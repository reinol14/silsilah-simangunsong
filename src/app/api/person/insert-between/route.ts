import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { parentMarriageId, targetPersonId, newPerson, newSpouse, moveAll } = body;

    if (!parentMarriageId || !targetPersonId || !newPerson?.nama || !newSpouse?.nama) {
      return NextResponse.json({ success: false, message: "Data tidak lengkap" }, { status: 400 });
    }

    // Pastikan pernikahan orang tua ada dan target memang anak dari pernikahan itu
    const parentMarriage = await prisma.marriage.findUnique({
      where: { id: parentMarriageId },
      include: { children: true },
    });

    if (!parentMarriage) {
      return NextResponse.json({ success: false, message: "Pernikahan orang tua tidak ditemukan" }, { status: 404 });
    }

    const targetChildRecord = parentMarriage.children.find(c => c.personId === targetPersonId);
    if (!targetChildRecord) {
      return NextResponse.json({ success: false, message: "Anak tidak ditemukan dalam pernikahan ini" }, { status: 404 });
    }

    const isNewPersonHusband = newPerson.jenisKelamin === "LAKI_LAKI";

    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat orang baru (yang disisipkan)
      const createdPerson = await tx.person.create({
        data: {
          nama: newPerson.nama.trim(),
          jenisKelamin: newPerson.jenisKelamin,
          tanggalLahir: newPerson.tanggalLahir ? new Date(newPerson.tanggalLahir) : null,
          tempatLahir: newPerson.tempatLahir?.trim() || null,
          foto: newPerson.foto?.trim() || null,
        } as any,
      });

      // 2. Buat pasangan orang baru
      const createdSpouse = await tx.person.create({
        data: {
          nama: newSpouse.nama.trim(),
          jenisKelamin: newSpouse.jenisKelamin,
          tanggalLahir: newSpouse.tanggalLahir ? new Date(newSpouse.tanggalLahir) : null,
          tempatLahir: newSpouse.tempatLahir?.trim() || null,
          foto: newSpouse.foto?.trim() || null,
        } as any,
      });

      // 3. Buat pernikahan antara orang baru dan pasangannya
      const newMarriage = await tx.marriage.create({
        data: {
          husbandId: isNewPersonHusband ? createdPerson.id : createdSpouse.id,
          wifeId:    isNewPersonHusband ? createdSpouse.id : createdPerson.id,
        },
      });

      // 4. Jadikan orang baru sebagai anak dari pernikahan orang tua (A & istri)
      await tx.child.create({
        data: { marriageId: parentMarriageId, personId: createdPerson.id },
      });

      // 5. Pindahkan anak-anak ke bawah pernikahan baru
      //    moveAll = true  → pindahkan semua anak pernikahan lama
      //    moveAll = false → hanya pindahkan target
      const childRecordIdsToMove = moveAll
        ? parentMarriage.children.map(c => c.id)
        : [targetChildRecord.id];

      await tx.child.updateMany({
        where: { id: { in: childRecordIdsToMove } },
        data: { marriageId: newMarriage.id },
      });

      return { newMarriage, createdPerson, createdSpouse };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Insert between error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
