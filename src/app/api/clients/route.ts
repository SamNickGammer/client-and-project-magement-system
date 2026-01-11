import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { z } from "zod";

const clientSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().optional(),
  status: z.string().optional(),
});

export async function GET() {
  try {
    const clients = await prisma.lead.findMany({
      where: { status: { in: ["CLIENT", "CONVERTED"] } },
      orderBy: { createdAt: "desc" },
      include: {
        contacts: { include: { contact: true } },
        projects: true,
      },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = clientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 },
      );
    }

    const newClient = await prisma.lead.create({
      data: {
        title: result.data.title,
        company: result.data.company,
        status: "CLIENT",
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 },
    );
  }
}
