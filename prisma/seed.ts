import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import bcrypt from "bcryptjs";

const dbPath = path.resolve("dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Default users
  const adminPassword = await bcrypt.hash("Admin@1234", 12);
  const pastorPassword = await bcrypt.hash("Pastor@1234", 12);

  await prisma.user.upsert({
    where: { email: "admin@church.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@church.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "pastor@church.com" },
    update: {},
    create: {
      name: "Senior Pastor",
      email: "pastor@church.com",
      password: pastorPassword,
      role: "PASTOR",
    },
  });

  console.log("Default users created:");
  console.log("  Admin:  admin@church.com  /  Admin@1234");
  console.log("  Pastor: pastor@church.com /  Pastor@1234");

  // Members
  const members = await Promise.all([
    prisma.member.create({
      data: {
        firstName: "Kwame",
        lastName: "Mensah",
        email: "kwame.mensah@example.com",
        phone: "+233 24 123 4567",
        gender: "Male",
        maritalStatus: "Married",
        occupation: "Engineer",
        city: "Accra",
        membershipDate: new Date("2020-01-15"),
        membershipStatus: "ACTIVE",
      },
    }),
    prisma.member.create({
      data: {
        firstName: "Abena",
        lastName: "Asante",
        email: "abena.asante@example.com",
        phone: "+233 20 987 6543",
        gender: "Female",
        maritalStatus: "Single",
        occupation: "Teacher",
        city: "Kumasi",
        membershipDate: new Date("2021-03-20"),
        membershipStatus: "ACTIVE",
      },
    }),
    prisma.member.create({
      data: {
        firstName: "Kofi",
        lastName: "Owusu",
        email: "kofi.owusu@example.com",
        phone: "+233 55 456 7890",
        gender: "Male",
        maritalStatus: "Married",
        occupation: "Doctor",
        city: "Accra",
        membershipDate: new Date("2019-06-10"),
        membershipStatus: "ACTIVE",
      },
    }),
    prisma.member.create({
      data: {
        firstName: "Akosua",
        lastName: "Boateng",
        email: "akosua.boateng@example.com",
        gender: "Female",
        maritalStatus: "Single",
        occupation: "Nurse",
        city: "Takoradi",
        membershipDate: new Date("2022-09-01"),
        membershipStatus: "PENDING",
      },
    }),
  ]);

  // Visitors
  const visitors = await Promise.all([
    prisma.visitor.create({
      data: {
        firstName: "Emmanuel",
        lastName: "Darko",
        phone: "+233 26 111 2222",
        gender: "Male",
        invitedBy: "Kwame Mensah",
        purpose: "First visit",
        visits: { create: { visitDate: new Date() } },
      },
    }),
    prisma.visitor.create({
      data: {
        firstName: "Grace",
        lastName: "Agyemang",
        email: "grace.agyemang@example.com",
        gender: "Female",
        invitedBy: "Abena Asante",
        purpose: "Seeking membership",
        visits: {
          create: [
            { visitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            { visitDate: new Date() },
          ],
        },
      },
    }),
  ]);

  // Programmes
  const sunday = await prisma.programme.create({
    data: {
      title: "Sunday Worship Service",
      type: "SERVICE",
      date: new Date(),
      startTime: "09:00",
      endTime: "12:00",
      venue: "Main Auditorium",
      description: "Weekly Sunday morning worship service",
    },
  });

  const midweek = await prisma.programme.create({
    data: {
      title: "Midweek Bible Study",
      type: "MEETING",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      startTime: "18:00",
      endTime: "20:00",
      venue: "Fellowship Hall",
      description: "Wednesday evening Bible study and prayer",
    },
  });

  // Attendance
  await Promise.all([
    prisma.attendance.create({
      data: {
        programmeId: sunday.id,
        memberId: members[0].id,
        attendeeType: "MEMBER",
      },
    }),
    prisma.attendance.create({
      data: {
        programmeId: sunday.id,
        memberId: members[1].id,
        attendeeType: "MEMBER",
      },
    }),
    prisma.attendance.create({
      data: {
        programmeId: sunday.id,
        visitorId: visitors[0].id,
        attendeeType: "VISITOR",
      },
    }),
    prisma.attendance.create({
      data: {
        programmeId: midweek.id,
        memberId: members[2].id,
        attendeeType: "MEMBER",
      },
    }),
  ]);

  // Sample Registration
  await prisma.registration.create({
    data: {
      firstName: "Daniel",
      lastName: "Amponsah",
      email: "daniel.amponsah@example.com",
      phone: "+233 50 333 4444",
      gender: "Male",
      city: "Accra",
      occupation: "Accountant",
      howDidYouHear: "Friend / Family",
      prayerRequest: "Please pray for my family and my new job.",
      status: "PENDING",
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
