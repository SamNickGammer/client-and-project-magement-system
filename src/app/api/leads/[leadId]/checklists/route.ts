import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

// GET: Fetch all checklists for a lead
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  try {
    const { leadId } = await params;

    const checklists = await prisma.leadChecklist.findMany({
      where: { leadId },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(checklists);
  } catch (error) {
    console.error("Error fetching checklists:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklists" },
      { status: 500 },
    );
  }
}

// POST: Create a new checklist
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  try {
    const { leadId } = await params;
    const body = await req.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const checklist = await prisma.leadChecklist.create({
      data: {
        title,
        leadId,
      },
      include: { items: true },
    });

    return NextResponse.json(checklist);
  } catch (error) {
    console.error("Error creating checklist:", error);
    return NextResponse.json(
      { error: "Failed to create checklist" },
      { status: 500 },
    );
  }
}
