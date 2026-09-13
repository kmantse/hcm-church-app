import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalMembers,
    activeMembers,
    totalVisitors,
    visitorsToday,
    totalProgrammes,
    upcomingProgrammes,
    pendingRegistrations,
    checkInsToday,
    recentAttendance,
    recentMembers,
    pendingFollowUps,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { membershipStatus: "ACTIVE" } }),
    prisma.visitor.count(),
    prisma.visit.count({ where: { visitDate: { gte: startOfDay } } }),
    prisma.programme.count(),
    prisma.programme.count({ where: { date: { gte: now } } }),
    prisma.registration.count({ where: { status: "PENDING" } }),
    prisma.attendance.count({ where: { checkInTime: { gte: startOfDay } } }),
    prisma.attendance.findMany({
      where: { checkInTime: { gte: startOfMonth } },
      include: { programme: true, member: true, visitor: true },
      orderBy: { checkInTime: "desc" },
      take: 5,
    }),
    prisma.member.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.followUp.count({ where: { status: { in: ["SCHEDULED", "NEEDS_FOLLOWUP"] } } }),
  ]);

  return NextResponse.json({
    totalMembers,
    activeMembers,
    totalVisitors,
    visitorsToday,
    totalProgrammes,
    upcomingProgrammes,
    pendingRegistrations,
    checkInsToday,
    recentAttendance,
    recentMembers,
    pendingFollowUps,
  });
}
