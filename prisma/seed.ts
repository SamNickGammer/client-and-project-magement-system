import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "test@example.com";
  const password = await bcrypt.hash("password123", 10);

  // 1. Seed User
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password,
    },
  });

  console.log({ user });

  // 2. Seed Employee
  const employeeEmail = "employee@example.com";
  const employee = await prisma.employee.upsert({
    where: { email: employeeEmail },
    update: {},
    create: {
      name: "Jane Doe",
      email: employeeEmail,
      position: "Sales Representative",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    },
  });
  console.log({ employee });

  // 3. Seed Contacts
  const contact1 = await prisma.contact.upsert({
    where: { id: "contact-1" }, // Using fixed IDs for idempotency in this seed
    update: {},
    create: {
      id: "contact-1",
      name: "Alice Smith",
      email: "alice@client.com",
      phone: "555-0101",
      company: "Wonder Tech",
      position: "CTO",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    },
  });

  const contact2 = await prisma.contact.upsert({
    where: { id: "contact-2" },
    update: {},
    create: {
      id: "contact-2",
      name: "Bob Jones",
      email: "bob@enterprise.com",
      company: "Big Corp",
      position: "Manager",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    },
  });
  console.log({ contacts: [contact1, contact2] });

  // 4. Seed Leads
  const lead1 = await prisma.lead.upsert({
    where: { id: "lead-1" },
    update: {},
    create: {
      id: "lead-1",
      title: "Enterprise License Deal",
      description: "Potential sale of 500 licenses.",
      status: "NEW",
      value: 50000,
      assignedToId: employee.id,
      contacts: {
        create: [{ contactId: contact1.id }],
      },
    },
  });

  const lead2 = await prisma.lead.upsert({
    where: { id: "lead-2" },
    update: {},
    create: {
      id: "lead-2",
      title: "Website Redesign",
      description: "Full overhaul of corporate website.",
      status: "QUALIFIED",
      value: 12000,
      assignedToId: employee.id,
      contacts: {
        create: [{ contactId: contact2.id }],
      },
    },
  });
  console.log({ leads: [lead1, lead2] });

  // 5. Seed Clients
  const client1 = await prisma.client.upsert({
    where: { id: "client-1" },
    update: {},
    create: {
      id: "client-1",
      name: "Acme Corp",
      company: "Acme Corp",
      status: "Active",
      contacts: {
        create: [{ contactId: contact1.id }],
      },
    },
  });
  console.log({ client1 });
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
