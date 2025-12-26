import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Fetch the lead with its contacts
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { contacts: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (lead.status === "CONVERTED") {
      return NextResponse.json(
        { error: "Lead is already converted" },
        { status: 400 },
      );
    }

    // Transaction: Update Lead -> Create Client -> Copy Contacts
    const client = await prisma.$transaction(async (tx) => {
      // 1. Update Lead Status
      await tx.lead.update({
        where: { id },
        data: { status: "CONVERTED" },
      });

      // 2. Create Client
      const newClient = await tx.client.create({
        data: {
          name: lead.title, // or use specific logic if lead title isn't suitable
          // copy value? company? - Currently Client schema has limited fields, basic copy
          status: "Active",
          leadId: id,
        },
      });

      // 3. Copy Contacts: Create ClientContact relations for all existing LeadContacts
      if (lead.contacts.length > 0) {
        await tx.clientContact.createMany({
          data: lead.contacts.map((lc) => ({
            clientId: newClient.id,
            contactId: lc.contactId,
          })),
        });
      }

      return newClient;
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error converting lead:", error);
    return NextResponse.json(
      { error: "Failed to convert lead" },
      { status: 500 },
    );
  }
}
