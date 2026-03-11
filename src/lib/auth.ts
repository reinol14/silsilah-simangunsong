import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import prisma from "./prisma";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  
  if (!token) return null;
  
  const session = await prisma.session.findUnique({
    where: { token },
    include: { admin: true },
  });
  
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }
  
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session.admin;
}

export async function verifyAuth(req: NextRequest) {
  const token = req.cookies.get("session_token")?.value;
  
  if (!token) return null;
  
  const session = await prisma.session.findUnique({
    where: { token },
    include: { admin: true },
  });
  
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }
  
  return session.admin;
}
