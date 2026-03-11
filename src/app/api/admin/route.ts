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

// ─── GET /api/admin ──────────────────────────────────────────────────────────
// List semua admin (admin only)
export async function GET(req: NextRequest) {
  const admin = await verifyAuth(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        nama: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    console.error("GET /api/admin error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data admin" }, { status: 500 });
  }
}

// ─── POST /api/admin ─────────────────────────────────────────────────────────
// Tambah admin baru (admin only)
export async function POST(req: NextRequest) {
  const admin = await verifyAuth(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username, password, nama } = await req.json();

    // Validasi
    if (!username || !password || !nama) {
      return NextResponse.json({ success: false, error: "Username, password, dan nama wajib diisi" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "Password minimal 6 karakter" }, { status: 400 });
    }

    // Cek username sudah dipakai
    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Username sudah digunakan" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Buat admin baru
    const newAdmin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        nama,
      },
      select: {
        id: true,
        username: true,
        nama: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: newAdmin });
  } catch (error) {
    console.error("POST /api/admin error:", error);
    return NextResponse.json({ success: false, error: "Gagal menambah admin" }, { status: 500 });
  }
}
