import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  try {
    const { leadId } = await params;

    // Fetch the lead with its contacts
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { contacts: true },
    });

    // Check if lead exists
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (lead.status === "CLIENT") {
      return NextResponse.json(
        { error: "Lead is already a client" },
        { status: 400 },
      );
    }

    // Update Lead Status to CLIENT
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "CLIENT",
        // Add chat divider for conversion event
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chatHistory: [
          {
            id: `system-convert-${Date.now()}`,
            type: "system",
            content: "Lead Converted to Client",
            createdAt: new Date().toISOString(),
            author: { id: "system", name: "System", image: null },
            reactions: [],
            replies: [],
          },
          ...((lead.chatHistory as any[]) || []),
        ] as any,
      },
    });

    return NextResponse.json(updatedLead);
  } catch (error: any) {
    console.error("Error converting lead:", error);
    return NextResponse.json(
      { error: "Failed to convert lead", details: error.message },
      { status: 500 },
    );
  }
}
