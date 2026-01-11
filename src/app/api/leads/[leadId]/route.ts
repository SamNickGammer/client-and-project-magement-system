import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { z } from "zod";

const leadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z
    .enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"])
    .optional(),
  value: z.number().optional(),
  assignedToId: z.string().optional().nullable(),
  contactIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  chatHistory: z.array(z.any()).optional(), // Allow JSON updates
});

const updateLeadSchema = leadSchema.partial();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  try {
    const { leadId } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        assignedTo: true,
        contacts: {
          include: {
            contact: true,
          },
        },

        attachments: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  try {
    const { leadId } = await params;
    const body = await req.json();
    // PUT usually implies full replacement or at least strictly validated structure
    const result = leadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 },
      );
    }

    const { contactIds, ...leadData } = result.data;

    // Transaction to update lead fields and sync contacts relation
    const updatedLead = await prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      await tx.lead.update({
        where: { id: leadId },
        data: { ...leadData },
      });

      // 2. Sync contacts if provided
      if (contactIds) {
        // Delete existing relations
        await tx.leadContact.deleteMany({
          where: { leadId: leadId },
        });
        // Create new relations
        if (contactIds.length > 0) {
          await tx.leadContact.createMany({
            data: contactIds.map((contactId) => ({
              leadId: leadId,
              contactId,
            })),
          });
        }
      }

      return tx.lead.findUnique({
        where: { id: leadId },
        include: {
          assignedTo: true,
          contacts: { include: { contact: true } },
          attachments: true,
        },
      });
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  try {
    const { leadId } = await params;
    const body = await req.json();
    const result = updateLeadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 },
      );
    }

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: result.data,
      include: {
        assignedTo: true,
        contacts: { include: { contact: true } },
        attachments: true,
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  try {
    const { leadId } = await params;
    await prisma.lead.delete({
      where: { id: leadId },
    });

    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 },
    );
  }
}
