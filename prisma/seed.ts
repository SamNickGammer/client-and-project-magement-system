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
  console.log("Start seeding ...");

  // Clean up existing data (optional, but good for idempotent runs if relations allow)
  // Be careful with deleteMany in production!
  // await prisma.taskAssignment.deleteMany();
  // await prisma.projectAssignment.deleteMany();
  // await prisma.task.deleteMany();
  // await prisma.project.deleteMany();
  // await prisma.leadContact.deleteMany();
  // await prisma.clientContact.deleteMany();
  // await prisma.lead.deleteMany();
  // await prisma.client.deleteMany();
  // await prisma.contact.deleteMany();
  // await prisma.employee.deleteMany();
  // await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  // 1. Specific User: om@scorptech.co (Director/Admin)
  const omUser = await prisma.user.upsert({
    where: { email: "om@scorptech.co" },
    update: {},
    create: {
      email: "om@scorptech.co",
      password,
      name: "Om Director",
      accessLevel: "DIRECTOR",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Om",
      phone: "+1234567890",
      status: "Active",
    },
  });
  console.log("Created user: om@scorptech.co");

  // 2. Users with different Access Levels
  const usersToCreate = [
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

  for (const u of usersToCreate) {
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
    console.log(`Created user: ${u.email}`);
  }

  // 3. Employees (Linked to some users essentially, but separate model in schema)
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
  console.log(`Seeded ${employees.length} employees`);

  // 4. Contacts
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

  const contacts = [];
  for (const c of contactsData) {
    const contact = await prisma.contact.upsert({
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
    contacts.push(contact);
  }

  // 5. Leads
  const leadsData = [
    {
      id: "l1",
      title: "Enterprise QoS System",
      description:
        "Implementation of quality of service monitoring for their entire network.",
      status: LeadStatus.NEW,
      value: 150000,
      assignedToEmail: "om@scorptech.co",
      contactIds: ["c1"],
    },
    {
      id: "l2",
      title: "POS Integration",
      description:
        "Integration of new POS software with legacy inventory systems.",
      status: LeadStatus.QUALIFIED,
      value: 45000,
      assignedToEmail: "jane.sales@scorptech.co",
      contactIds: ["c2"],
    },
    {
      id: "l3",
      title: "Mobile App MVP",
      description:
        "Development of a minimum viable product for their new delivery service.",
      status: LeadStatus.CONTACTED,
      value: 25000,
      assignedToEmail: "john.tech@scorptech.co",
      contactIds: ["c3"],
    },
    {
      id: "l4",
      title: "Supply Chain Analytics",
      description: "Dashboard for visualizing supply chain bottlenecks.",
      status: LeadStatus.CONVERTED, // Will be linked to a client/project
      value: 80000,
      assignedToEmail: "om@scorptech.co",
      contactIds: ["c4"],
    },
    {
      id: "l5",
      title: "Security Audit",
      description: "Full security audit of their fintech platform.",
      status: LeadStatus.LOST,
      value: 12000,
      assignedToEmail: "john.tech@scorptech.co",
      contactIds: ["c5"],
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
        contacts: {
          create: l.contactIds.map((cid) => ({ contactId: cid })),
        },
      },
    });
  }
  console.log(`Seeded ${leadsData.length} leads`);

  // 6. Clients
  // Convert 'l4' (Supply Chain Analytics) to a Client
  const client1 = await prisma.client.upsert({
    where: { id: "cl1" },
    update: {},
    create: {
      id: "cl1",
      name: "Logistics Net",
      company: "Logistics Net",
      status: "Active",
      leadId: "l4", // Link to the converted lead
      contacts: {
        create: [{ contactId: "c4" }],
      },
    },
  });

  const client2 = await prisma.client.upsert({
    where: { id: "cl2" },
    update: {},
    create: {
      id: "cl2",
      name: "Previous Client Inc",
      company: "Previous Client Inc",
      status: "Active",
      contacts: {
        create: [{ contactId: "c5" }], // Example reusing a contact or just adding one
      },
    },
  });
  console.log("Seeded clients");

  // 7. Projects
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
      clientId: client1.id,
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
          {
            employeeId: employees.find(
              (e) => e.email === "sarah.design@scorptech.co",
            )!.id,
          },
        ],
      },
    },
  });

  // 8. Tasks
  const tasksData = [
    {
      title: "Design Database Schema",
      status: TaskStatus.DONE,
      priority: "High",
      projectId: project1.id,
      assigneeEmail: "john.tech@scorptech.co",
    },
    {
      title: "Create High Fidelity Mocktypes",
      status: TaskStatus.IN_PROGRESS,
      priority: "Medium",
      projectId: project1.id,
      assigneeEmail: "sarah.design@scorptech.co",
    },
    {
      title: "Setup CI/CD Pipeline",
      status: TaskStatus.TODO,
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
