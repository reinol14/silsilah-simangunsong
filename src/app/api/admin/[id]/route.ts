import { NextRequest, NextResponse } from "next/server";
import { randomBytes, pbkdf2Sync } from "crypto";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

// ─── Password helper ─────────────────────────────────────────────────────────
const ITER = 100_000;
const KEYLEN = 64;
const DIGEST = "sha512";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, ITER, KEYLEN, DIGEST).toString("hex");
  return `pbkdf2:${salt}:${hash}`;
}

// ─── GET /api/admin/[id] ─────────────────────────────────────────────────────
// Get admin by ID (admin only)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAuth(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const adminData = await prisma.admin.findUnique({
      where: { id: parseInt(id, 10) },
      select: {
        id: true,
        username: true,
        nama: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!adminData) {
      return NextResponse.json({ success: false, error: "Admin tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: adminData });
  } catch (error) {
    console.error("GET /api/admin/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data admin" }, { status: 500 });
  }
}

// ─── PUT /api/admin/[id] ─────────────────────────────────────────────────────
// Update admin (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAuth(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { username, password, nama } = await req.json();
    const adminId = parseInt(id, 10);

    // Validasi
    if (!username || !nama) {
      return NextResponse.json({ success: false, error: "Username dan nama wajib diisi" }, { status: 400 });
    }

    // Cek admin exists
    const existing = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Admin tidak ditemukan" }, { status: 404 });
    }

    // Cek username conflict dengan admin lain
    if (username !== existing.username) {
      const conflict = await prisma.admin.findUnique({ where: { username } });
      if (conflict && conflict.id !== adminId) {
        return NextResponse.json({ success: false, error: "Username sudah digunakan" }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      username,
      nama,
    };

    // Update password jika diisi
    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return NextResponse.json({ success: false, error: "Password minimal 6 karakter" }, { status: 400 });
      }
      updateData.password = hashPassword(password);
    }

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        username: true,
        nama: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedAdmin });
  } catch (error) {
    console.error("PUT /api/admin/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengupdate admin" }, { status: 500 });
  }
}

// ─── DELETE /api/admin/[id] ──────────────────────────────────────────────────
// Hapus admin (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAuth(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const adminId = parseInt(id, 10);

    // Cek admin exists
    const existing = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Admin tidak ditemukan" }, { status: 404 });
    }

    // Tidak boleh hapus diri sendiri
    if (admin.id === adminId) {
      return NextResponse.json({ success: false, error: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
    }

    // Hapus admin (sessions akan terhapus otomatis karena onDelete: Cascade)
    await prisma.admin.delete({ where: { id: adminId } });

    return NextResponse.json({ success: true, message: "Admin berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/admin/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus admin" }, { status: 500 });
  }
}
