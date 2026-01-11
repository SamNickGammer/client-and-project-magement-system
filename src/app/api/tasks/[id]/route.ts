import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { z } from "zod";
import { TaskStatus } from "@/generated/prisma";

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.string().optional(),
  order: z.number().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const result = updateTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 },
      );
    }

    const { dueDate, ...rest } = result.data;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await prisma.task.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
