import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

// PUT: Update an item (toggle complete, change title/priority)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await params;
    const body = await req.json();

    // We update whatever is passed
    const item = await prisma.checklistItem.update({
      where: { id: itemId },
      data: body,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating checklist item:", error);
    return NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 },
    );
  }
}

// DELETE: Remove an item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await params;

    await prisma.checklistItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: "Item deleted" });
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    return NextResponse.json(
      { error: "Failed to delete checklist item" },
      { status: 500 },
    );
  }
}
