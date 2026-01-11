/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PrismaClient,
  AccessLevel,
  LeadStatus,
  TaskStatus,
} from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Start seeding v2 ...");

  // 1. Users
  const password = await bcrypt.hash("password123", 10);
  const users = [
    {
      email: "om@scorptech.co",
      name: "Om Director",
      role: "DIRECTOR",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Om",
    },
    {
      email: "hr@scorptech.co",
      name: "Helen HR",
      role: "HR",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Helen",
    },
    {
      email: "dev@scorptech.co",
      name: "Dave Developer",
      role: "DEVELOPER",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dave",
    },
    {
      email: "marketing@scorptech.co",
      name: "Mary Marketing",
      role: "MARKETING",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mary",
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password,
        name: u.name,
        accessLevel: u.role as AccessLevel,
        image: u.image,
        status: "Active",
      },
    });
  }
  console.log("Seeded users");

  // 2. Employees
  const employeesData = [
    {
      name: "Om Director",
      email: "om@scorptech.co",
      position: "Director",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Om",
    },
    {
      name: "Jane Sales",
      email: "jane.sales@scorptech.co",
      position: "Sales Representative",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    },
    {
      name: "John Tech",
      email: "john.tech@scorptech.co",
      position: "Senior Engineer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    },
    {
      name: "Sarah Design",
      email: "sarah.design@scorptech.co",
      position: "UI/UX Designer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
  ];

  const employees = [];
  for (const emp of employeesData) {
    const e = await prisma.employee.upsert({
      where: { email: emp.email },
      update: {},
      create: emp,
    });
    employees.push(e);
  }
  console.log("Seeded employees");

  // 3. Contacts
  const contactsData = [
    {
      id: "c1",
      name: "Alice Smith",
      email: "alice@techcorp.com",
      company: "TechCorp",
      position: "CTO",
    },
    {
      id: "c2",
      name: "Bob Jones",
      email: "bob@retailgiant.com",
      company: "Retail Giant",
      position: "Procurement Manager",
    },
    {
      id: "c3",
      name: "Charlie Day",
      email: "charlie@startup.io",
      company: "StartUp.io",
      position: "CEO",
    },
    {
      id: "c4",
      name: "Dana White",
      email: "dana@logistics.net",
      company: "Logistics Net",
      position: "Operations Head",
    },
    {
      id: "c5",
      name: "Evan Wright",
      email: "evan@finserve.org",
      company: "FinServe",
      position: "IT Director",
    },
  ];

  for (const c of contactsData) {
    await prisma.contact.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        email: c.email,
        company: c.company,
        position: c.position,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name.replace(" ", "")}`,
      },
    });
  }
  console.log("Seeded contacts");

  // 4. Leads (Standard)
  const leadsData = [
    {
      id: "l1",
      title: "Enterprise QoS System",
      description: "Implementation of quality of service monitoring.",
      status: LeadStatus.NEW,
      value: 150000,
      assignedToEmail: "om@scorptech.co",
      contactIds: ["c1"],
      tags: ["Network", "Enterprise"],
    },
    {
      id: "l2",
      title: "POS Integration",
      description: "Integration of new POS software.",
      status: LeadStatus.QUALIFIED,
      value: 45000,
      assignedToEmail: "jane.sales@scorptech.co",
      contactIds: ["c2"],
      tags: ["Retail", "Integration"],
    },
    {
      id: "l3",
      title: "Mobile App MVP",
      description: "MVP for delivery service.",
      status: LeadStatus.CONTACTED,
      value: 25000,
      assignedToEmail: "john.tech@scorptech.co",
      contactIds: ["c3"],
      tags: ["Mobile", "Startup"],
    },
  ];

  for (const l of leadsData) {
    const assignedEmployee = employees.find(
      (e) => e.email === l.assignedToEmail,
    );
    await prisma.lead.upsert({
      where: { id: l.id },
      update: {},
      create: {
        id: l.id,
        title: l.title,
        description: l.description,
        status: l.status,
        value: l.value,
        assignedToId: assignedEmployee?.id,
        tags: l.tags,
        contacts: {
          create: l.contactIds.map((cid) => ({ contactId: cid })),
        },
      },
    });
  }
  console.log("Seeded standard leads");

  // 5. Clients (Leads with CLIENT status)
  const clientsData = [
    {
      id: "cl1",
      title: "Logistics Net",
      company: "Logistics Net",
      description: "Long-term logistics partner.",
      status: LeadStatus.CLIENT,
      value: 80000,
      assignedToEmail: "om@scorptech.co",
      contactIds: ["c4"],
      tags: ["Logistics", "Client"],
    },
    {
      id: "cl2",
      title: "Previous Client Inc",
      company: "Previous Client Inc",
      description: "Former contract partner.",
      status: LeadStatus.CLIENT,
      value: 0,
      assignedToEmail: "jane.sales@scorptech.co",
      contactIds: ["c5"],
      tags: ["Finance", "Client"],
    },
  ];

  for (const c of clientsData) {
    const assignedEmployee = employees.find(
      (e) => e.email === c.assignedToEmail,
    );
    await prisma.lead.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        title: c.title,
        company: c.company,
        description: c.description,
        status: c.status,
        value: c.value,
        assignedToId: assignedEmployee?.id,
        tags: c.tags,
        contacts: {
          create: c.contactIds.map((cid) => ({ contactId: cid })),
        },
      },
    });
  }
  console.log("Seeded clients (as Leads with CLIENT status)");

  // 6. Projects (Linked to CLIENT leads)
  const project1 = await prisma.project.upsert({
    where: { id: "p1" },
    update: {},
    create: {
      id: "p1",
      title: "Supply Chain Analytics Dashboard",
      description: "Phase 1 of the analytics dashboard development.",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      budget: 80000,
      status: "In Progress",
      leadId: "cl1", // Linked to the Client Lead
      assignments: {
        create: [
          {
            employeeId: employees.find((e) => e.email === "om@scorptech.co")!
              .id,
          },
          {
            employeeId: employees.find(
              (e) => e.email === "john.tech@scorptech.co",
            )!.id,
          },
        ],
      },
    },
  });
  console.log("Seeded projects");

  // 7. Tasks
  const tasksData = [
    {
      title: "Design Database Schema",
      status: TaskStatus.DONE,
      priority: "High",
      projectId: project1.id,
      assigneeEmail: "john.tech@scorptech.co",
    },
    {
      title: "Client Meeting - Requirements Review",
      status: TaskStatus.TODO,
      priority: "Medium",
      projectId: project1.id,
      assigneeEmail: "om@scorptech.co",
    },
  ];

  for (const t of tasksData) {
    const employee = employees.find((e) => e.email === t.assigneeEmail);
    if (employee) {
      await prisma.task.create({
        data: {
          title: t.title,
          status: t.status,
          priority: t.priority,
          projectId: t.projectId,
          assignments: {
            create: [{ employeeId: employee.id }],
          },
        },
      });
    }
  }
  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
