import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { z } from "zod";
import { LeadStatus } from "@/generated/prisma";

const clientSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const client = await prisma.lead.findUnique({
      where: { id },
      include: {
        contacts: { include: { contact: true } },
        projects: {
          include: {
            tasks: { select: { status: true } },
            assignments: { include: { employee: true } },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = clientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 },
      );
    }

    const updatedClient = await prisma.lead.update({
      where: { id },
      data: {
        title: result.data.title,
        company: result.data.company,
        status: result.data.status,
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 },
    );
  }
}
