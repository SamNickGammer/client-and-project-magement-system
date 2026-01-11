import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { z } from "zod";

const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  leadId: z.string().min(1, "Lead ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = createProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 },
      );
    }

    const { title, description, startDate, endDate, status, leadId } =
      result.data;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
        leadId,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
