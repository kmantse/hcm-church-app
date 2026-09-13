import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession, hashPassword } from "@/lib/auth";
import { hasRole } from "@/lib/permissions";

async function requireAdmin() {
  const session = await getServerSession();
  if (!session) return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!hasRole(session.role, "ADMIN")) return { session, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { session, error: null };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await params;
  const body = await request.json();

  // Prevent demoting/deactivating yourself
  if (check.session!.userId === id && (body.role || body.isActive === false)) {
    return NextResponse.json({ error: "You cannot change your own role or status" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.role) data.role = body.role;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (body.email) data.email = body.email.toLowerCase().trim();
  if (body.password) data.password = await hashPassword(body.password);

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await params;

  if (check.session!.userId === id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
