// app/api/person/create-with-relations/route.ts
// POST endpoint untuk create person lengkap dengan relasi (parent marriage, marriage, children)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Data person
      nama,
      jenisKelamin,
      tanggalLahir,
      tanggalWafat,
      tempatLahir,
      foto,
      // Relasi orang tua
      parentMarriageId,
      // Relasi pernikahan
      isMarried,
      spouseId,
      tanggalMenikah,
      // Anak-anak (array of person IDs yang sudah ada)
      childrenIds,
    } = body;

    // Validasi basic
    if (!nama || !jenisKelamin) {
      return NextResponse.json(
        { success: false, message: "Nama dan jenis kelamin wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi jenis kelamin
    if (!["LAKI_LAKI", "PEREMPUAN"].includes(jenisKelamin)) {
      return NextResponse.json(
        { success: false, message: "Jenis kelamin tidak valid" },
        { status: 400 }
      );
    }

    // Validasi pernikahan
    if (isMarried && !spouseId) {
      return NextResponse.json(
        { success: false, message: "Pasangan harus dipilih jika sudah menikah" },
        { status: 400 }
      );
    }

    // Validasi spouse exists
    if (spouseId) {
      const spouseExists = await prisma.person.findUnique({
        where: { id: parseInt(spouseId) },
      });
      if (!spouseExists) {
        return NextResponse.json(
          { success: false, message: "Pasangan tidak ditemukan" },
          { status: 404 }
        );
      }
    }

    // Validasi parent marriage
    if (parentMarriageId) {
      const parentMarriage = await prisma.marriage.findUnique({
        where: { id: parseInt(parentMarriageId) },
      });
      if (!parentMarriage) {
        return NextResponse.json(
          { success: false, message: "Pernikahan orang tua tidak ditemukan" },
          { status: 404 }
        );
      }
    }

    // Mulai transaksi
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create person
      const person = await tx.person.create({
        data: {
          nama,
          jenisKelamin,
          tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
          tanggalWafat: tanggalWafat ? new Date(tanggalWafat) : null,
          tempatLahir: tempatLahir || null,
          foto: foto || null,
        },
      });

      // 2. Link ke parent marriage (person ini adalah anak dari)
      if (parentMarriageId) {
        await tx.child.create({
          data: {
            marriageId: parseInt(parentMarriageId),
            personId: person.id,
          },
        });
      }

      // 3. Create marriage jika sudah menikah
      let marriage: { id: number } | null = null;
      if (isMarried && spouseId) {
        const spouseIdInt = parseInt(spouseId);
        
        // Tentukan husband dan wife berdasarkan gender
        const husbandId = jenisKelamin === "LAKI_LAKI" ? person.id : spouseIdInt;
        const wifeId = jenisKelamin === "PEREMPUAN" ? person.id : spouseIdInt;

        marriage = await tx.marriage.create({
          data: {
            husbandId,
            wifeId,
            tanggalMenikah: tanggalMenikah ? new Date(tanggalMenikah) : null,
          },
        });

        // 4. Link anak-anak ke marriage ini
        if (childrenIds && Array.isArray(childrenIds) && childrenIds.length > 0) {
          await tx.child.createMany({
            data: childrenIds.map((childId: number) => ({
              marriageId: marriage!.id,
              personId: parseInt(childId.toString()),
            })),
            skipDuplicates: true,
          });
        }
      }

      return { person, marriage };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Data berhasil disimpan",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/person/create-with-relations error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Gagal menyimpan data",
      },
      { status: 500 }
    );
  }
}
