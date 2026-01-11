import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { z } from "zod";
import { TaskStatus } from "@/generated/prisma";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.string().optional(),
  projectId: z.string().min(1, "Project ID is required"),
  order: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = createTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 },
      );
    }

    const { title, description, dueDate, status, priority, projectId, order } =
      result.data;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: status || "TODO",
        priority,
        projectId,
        order: order || 0,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
