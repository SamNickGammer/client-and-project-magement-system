import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { z } from "zod";

const leadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z
    .enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"])
    .default("NEW"),
  value: z.number().optional(),
  assignedToId: z.string().optional(), // Employee ID
  contactIds: z.array(z.string()).optional(), // List of Contact IDs
});

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: true,
        contacts: {
          include: {
            contact: true,
          },
        },
        client: true,
      },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = leadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 },
      );
    }

    const { contactIds, ...leadData } = result.data;

    const newLead = await prisma.lead.create({
      data: {
        ...leadData,
        contacts:
          contactIds && contactIds.length > 0
            ? {
                create: contactIds.map((id) => ({
                  contact: { connect: { id } },
                })),
              }
            : undefined,
      },
      include: {
        assignedTo: true,
        contacts: { include: { contact: true } },
      },
    });

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 },
    );
  }
}
