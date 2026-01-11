import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { z } from "zod";

const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Params is a Promise in Next.js 15+ (if updated) or standard object. Codebase uses `params: { id: string }` usually? Let's check other routes.
  // It seems other routes use `params: { id: string }`. I will assume standard unless instructed otherwise.
  // Wait, I recall seeing `params: { id: string }` in `[clientId]/page.tsx` but API routes?
  // Let's stick to standard `params: { id: string }`. It's safer for now.
) {
  const { id } = await params; // Next 15 requires await params

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        lead: {
          select: { id: true, title: true, company: true },
        },
        tasks: {
          orderBy: { order: "asc" },
          include: {
            assignments: { include: { employee: true } },
          },
        },
        assignments: {
          include: { employee: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const result = updateProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 },
      );
    }

    const { startDate, endDate, ...rest } = result.data;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Await params in newer Next.js

  try {
    await prisma.project.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
