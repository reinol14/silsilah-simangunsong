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
    const marriageId = Number(body?.marriageId);
    const personId = Number(body?.personId);
    const urutanAnak = body?.urutanAnak == null ? null : Number(body.urutanAnak);

    if (!Number.isInteger(marriageId) || !Number.isInteger(personId)) {
      return NextResponse.json(
        { success: false, message: "marriageId dan personId wajib berupa angka valid" },
        { status: 400 }
      );
    }

    const [marriage, person] = await Promise.all([
      prisma.marriage.findUnique({ where: { id: marriageId } }),
      prisma.person.findUnique({ where: { id: personId } }),
    ]);

    if (!marriage) {
      return NextResponse.json({ success: false, message: "Pernikahan tidak ditemukan" }, { status: 404 });
    }

    if (!person) {
      return NextResponse.json({ success: false, message: "Person tidak ditemukan" }, { status: 404 });
    }

    const existingAsChild = await prisma.child.findFirst({ where: { personId } });
    if (existingAsChild) {
      return NextResponse.json(
        { success: false, message: "Person ini sudah terdaftar sebagai anak pada pasangan lain" },
        { status: 400 }
      );
    }

    const finalUrutan = Number.isInteger(urutanAnak)
      ? urutanAnak
      : (await prisma.child.count({ where: { marriageId } })) + 1;

    const child = await prisma.child.create({
      data: {
        marriageId,
        personId,
        urutanAnak: finalUrutan,
      },
      include: {
        person: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
            tanggalLahir: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: child, message: "Anak berhasil ditambahkan" });
  } catch (error) {
    console.error("POST /api/child error:", error);
    return NextResponse.json({ success: false, message: "Gagal menambahkan anak" }, { status: 500 });
  }
}
