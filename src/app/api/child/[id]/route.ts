import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const childId = Number(id);

    if (!Number.isInteger(childId)) {
      return NextResponse.json({ success: false, message: "ID child tidak valid" }, { status: 400 });
    }

    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        person: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
            tanggalLahir: true,
            tanggalWafat: true,
          },
        },
        marriage: {
          include: {
            husband: { select: { id: true, nama: true } },
            wife: { select: { id: true, nama: true } },
          },
        },
      },
    });

    if (!child) {
      return NextResponse.json({ success: false, message: "Data child tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: child });
  } catch (error) {
    console.error("GET /api/child/[id] error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data child" }, { status: 500 });
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
    const childId = Number(id);

    if (!Number.isInteger(childId)) {
      return NextResponse.json({ success: false, message: "ID child tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const personId = body?.personId == null ? undefined : Number(body.personId);
    const marriageId = body?.marriageId == null ? undefined : Number(body.marriageId);
    const urutanAnak = body?.urutanAnak == null ? undefined : Number(body.urutanAnak);

    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) {
      return NextResponse.json({ success: false, message: "Data child tidak ditemukan" }, { status: 404 });
    }

    if (personId !== undefined) {
      if (!Number.isInteger(personId)) {
        return NextResponse.json({ success: false, message: "personId tidak valid" }, { status: 400 });
      }

      const person = await prisma.person.findUnique({ where: { id: personId } });
      if (!person) {
        return NextResponse.json({ success: false, message: "Person tidak ditemukan" }, { status: 404 });
      }

      const duplicate = await prisma.child.findFirst({
        where: {
          personId,
          id: { not: childId },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "Person ini sudah terdaftar sebagai anak pada pasangan lain" },
          { status: 400 }
        );
      }
    }

    if (marriageId !== undefined) {
      if (!Number.isInteger(marriageId)) {
        return NextResponse.json({ success: false, message: "marriageId tidak valid" }, { status: 400 });
      }

      const marriage = await prisma.marriage.findUnique({ where: { id: marriageId } });
      if (!marriage) {
        return NextResponse.json({ success: false, message: "Pernikahan tidak ditemukan" }, { status: 404 });
      }
    }

    if (urutanAnak !== undefined && !Number.isInteger(urutanAnak)) {
      return NextResponse.json({ success: false, message: "urutanAnak tidak valid" }, { status: 400 });
    }

    const updated = await prisma.child.update({
      where: { id: childId },
      data: {
        ...(personId !== undefined ? { personId } : {}),
        ...(marriageId !== undefined ? { marriageId } : {}),
        ...(urutanAnak !== undefined ? { urutanAnak } : {}),
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
        marriage: {
          include: {
            husband: { select: { id: true, nama: true } },
            wife: { select: { id: true, nama: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated, message: "Data anak berhasil diperbarui" });
  } catch (error) {
    console.error("PUT /api/child/[id] error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui data anak" }, { status: 500 });
  }
}
