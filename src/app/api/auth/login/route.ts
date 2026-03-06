import { NextRequest, NextResponse } from "next/server";
import { randomBytes, pbkdf2Sync, timingSafeEqual } from "crypto";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

// ─── Password helpers ────────────────────────────────────────────────────────
const ITER = 100_000;
const KEYLEN = 64;
const DIGEST = "sha512";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, ITER, KEYLEN, DIGEST).toString("hex");
  return `pbkdf2:${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith("pbkdf2:")) {
    const parts = stored.split(":");
    if (parts.length !== 3) return false;
    const [, salt, hash] = parts;
    const hashBuffer = Buffer.from(hash, "hex");
    const newHash = pbkdf2Sync(password, salt, ITER, KEYLEN, DIGEST);
    return timingSafeEqual(hashBuffer, newHash);
  }
  // Legacy plaintext — compare using timingSafeEqual to prevent timing attacks
  const a = Buffer.from(stored);
  const b = Buffer.from(password);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// ─── POST /api/auth/login ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin || !verifyPassword(password, admin.password)) {
      return NextResponse.json(
        { success: false, error: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Upgrade legacy plaintext password to hashed on successful login
    if (!admin.password.startsWith("pbkdf2:")) {
      await prisma.admin.update({
        where: { id: admin.id },
        data: { password: hashPassword(password) },
      });
    }

    // Create session with cryptographically secure token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: { adminId: admin.id, token, expiresAt },
    });

    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        nama: admin.nama,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
