import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { LeadStatus } from "@/generated/prisma";

export async function GET() {
  try {
    // 1. Total Clients
    const totalClients = await prisma.lead.count({
      where: {
        status: LeadStatus.CLIENT,
      },
    });

    // 2. Active Leads (Not Client, Converted, or Lost)
    const activeLeads = await prisma.lead.count({
      where: {
        status: {
          in: [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED],
        },
      },
    });

    // 3. Total Contacts
    const totalContacts = await prisma.contact.count();

    // 4. Recent Leads (excluding clients)
    const recentLeads = await prisma.lead.findMany({
      where: {
        status: {
          not: LeadStatus.CLIENT,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        assignedTo: true,
      },
    });

    // 5. Recent Clients
    const recentClients = await prisma.lead.findMany({
      where: {
        status: LeadStatus.CLIENT,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        assignedTo: true, // You might want to show account manager
      },
    });

    return NextResponse.json({
      totalClients,
      activeLeads,
      totalContacts,
      recentLeads,
      recentClients,
    });
  } catch (error) {
    console.error("Error fetching CRM dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
