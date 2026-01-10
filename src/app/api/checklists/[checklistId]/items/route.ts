import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

// POST: Add a new item to a checklist
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ checklistId: string }> },
) {
  try {
    const { checklistId } = await params;
    const body = await req.json();
    const { title, priority } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const item = await prisma.checklistItem.create({
      data: {
        title,
        priority: priority || "medium",
        checklistId,
        isCompleted: false,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error creating checklist item:", error);
    return NextResponse.json(
      { error: "Failed to create checklist item" },
      { status: 500 },
    );
  }
}
