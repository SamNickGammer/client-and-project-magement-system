import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { z } from "zod";

const createAttachmentSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  size: z.number().int().positive(),
  type: z.string(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  try {
    const { leadId } = await params;
    const body = await req.json();
    const result = createAttachmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 },
      );
    }

    const { name, url, size, type } = result.data;

    const attachment = await prisma.leadAttachment.create({
      data: {
        leadId,
        name,
        url,
        size,
        type,
        uploadedBy: "User", // TODO: Get actual user from session
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("Error creating attachment:", error);
    return NextResponse.json(
      { error: "Failed to create attachment" },
      { status: 500 },
    );
  }
}
